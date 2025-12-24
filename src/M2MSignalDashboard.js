import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaBroadcastTower,
  FaSignal,
  FaSatelliteDish,
  FaGlobe,
  FaSyncAlt,
} from "react-icons/fa";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function M2MSignalDashboard() {
  const BASE_URL =
    "https://nonrelated-spirometrical-ashley.ngrok-free.dev/api/m2m";

  // STATES
  const [signal, setSignal] = useState(null);
  const [satellite, setSatellite] = useState("-");
  const [time, setTime] = useState("");
  const [imei, setIMEI] = useState("-");
  const [imsi, setIMSI] = useState("-");
  const [network, setNetwork] = useState("-");
  const [apnList, setAPNList] = useState([]);

  const [newAPN, setNewAPN] = useState("");
  const [apnUser, setApnUser] = useState("");
  const [apnPass, setApnPass] = useState("");

  const [pdpIP, setPdpIP] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdpActive, setPdpActive] = useState(false);
  const [signalHistory, setSignalHistory] = useState([]);

  // UTILITIES
  const dbToPercent = (db) => {
    if (db === null || isNaN(db)) return 0;
    const min = -110;
    const max = -40;
    const val = Math.max(min, Math.min(max, db));
    return Math.round(((val - min) / (max - min)) * 100);
  };

  const signalLabel = (db) => {
    if (db === null || isNaN(db))
      return { text: "No Signal", color: "#9ca3af" };
    if (db >= -50) return { text: "Excellent", color: "#16a34a" };
    if (db >= -70) return { text: "Good", color: "#f59e0b" };
    if (db >= -85) return { text: "Weak", color: "#f97316" };
    return { text: "Critical", color: "#ef4444" };
  };

  const NETWORK_COLORS = {
    "0 - Not registered": "text-danger",
    "1 - Registered (home)": "text-success",
    "2 - Searching": "text-warning",
    "3 - Registration denied": "text-danger",
    "4 - Unknown": "text-secondary",
    "5 - Roaming": "text-info",
  };

  // =============================
  //  FETCH — SEQUENTIAL (pakai endpoint backend final)
  // =============================
  const fetchAll = async () => {
    setLoading(true);
    try {
      const headers = {
        "ngrok-skip-browser-warning": "true",
      };

      const sRes = await fetch(`${BASE_URL}/signal`, { headers });
      const s = await sRes.json();
      setSignal(s.signal_strength ?? null);
      setTime(s.timestamp || "");

      const satRes = await fetch(`${BASE_URL}/satellite`, { headers });
      const sat = await satRes.json();
      setSatellite(`${sat.satellite_id ?? "-"} - ${sat.satellite_name ?? "-"}`);

      const imeiRes = await fetch(`${BASE_URL}/imei`, { headers });
      const imeiData = await imeiRes.json();
      setIMEI(imeiData.imei || "-");

      const imsiRes = await fetch(`${BASE_URL}/imsi`, { headers });
      const imsiData = await imsiRes.json();
      setIMSI(imsiData.imsi || "-");

      const netRes = await fetch(`${BASE_URL}/network`, { headers });
      const netData = await netRes.json();
      setNetwork(netData.status_text || "-");

      const apnRes = await fetch(`${BASE_URL}/apn`, { headers });
      const apnData = await apnRes.json();
      setAPNList(apnData.profiles || []);

      const pdpRes = await fetch(`${BASE_URL}/pdp-status`, { headers });
      const pdpData = await pdpRes.json();

      setPdpActive(pdpData.pdp_active === true);
      setPdpIP(pdpData.ip || null);
    } catch (err) {
      console.log("Fetch error:", err);
    }
    setLoading(false);
  };

  const fetchSignalHistory = async () => {
    try {
      const res = await fetch(`${BASE_URL}/signal-history?limit=50`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      const data = await res.json();
      setSignalHistory(data);
    } catch (err) {
      console.log("History fetch error:", err);
    }
  };

  // INITIAL LOAD + INTERVAL
  useEffect(() => {
    fetchAll();
    const timer = setInterval(fetchAll, 10000); // 10 detik (lebih santai ke modem)
    return () => clearInterval(timer);
  }, []);

  const isConnected = signal !== null && !isNaN(signal);
  const pct = dbToPercent(signal);
  const sl = signalLabel(signal);

  useEffect(() => {
    fetchSignalHistory();
    const t = setInterval(fetchSignalHistory, 30000); // 30 detik
    return () => clearInterval(t);
  }, []);

  // =============================
  //  APN SAVE (save saja, auth lewat PDP)
  // =============================
  const handleSetAPN = async () => {
    if (!newAPN.trim()) return alert("Please fill APN name");
    if (!apnUser.trim()) return alert("Please fill username");
    if (!apnPass.trim()) return alert("Please fill password");

    try {
      const res = await fetch(`${BASE_URL}/apn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          apn: newAPN,
          user: apnUser,
          pass: apnPass,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ APN saved! PDP not activated yet.");
      } else {
        alert("❌ Failed saving APN.");
      }
    } catch (err) {
      alert("❌ Error while saving APN.");
      console.log(err);
    }

    setNewAPN("");
    setApnUser("");
    setApnPass("");

    fetchAll();
  };

  // =============================
  //  PDP ACTIVATE
  // =============================
  const handleActivatePDP = async () => {
    try {
      const res = await fetch(`${BASE_URL}/pdp-activate`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        alert(`✅ PDP Activated!\nIP: ${data.ip}`);
      } else {
        alert(
          `❌ PDP activation failed.\nReason: ${
            data.message || "Unknown error"
          }`
        );
      }
    } catch (err) {
      alert("❌ Connection error activating PDP.");
    }

    // Refresh snapshot after action
    setTimeout(fetchAll, 1500);
  };

  const handleDeactivatePDP = async () => {
    try {
      await fetch(`${BASE_URL}/pdp-deactivate`, {
        method: "POST",
        headers: { "ngrok-skip-browser-warning": "true" },
      });
    } catch (err) {
      alert("❌ Connection error deactivating PDP.");
    }

    // biarin polling yang update status
    setTimeout(fetchAll, 1500);
  };

  // =============================
  //  UI
  // =============================
  return (
    <div className="dashboard-root d-flex justify-content-center">
      <div style={{ width: "100%", maxWidth: 1100 }}>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <FaBroadcastTower size={26} className="me-2 text-primary" />
            <div>
              <h3 className="mb-0 fw-bold">BGAN M2M Dashboard</h3>
              <div className="muted-small">Realtime Satellite Monitoring</div>
            </div>
          </div>
          <span
            className={`badge-soft ${
              isConnected ? "status-connected" : "status-offline"
            }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        {/* TOP GRID */}
        <div
          className="card card-rounded p-4 mb-4"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: 20,
          }}
        >
          {/* LEFT */}
          <div>
            <div className="card card-rounded p-3 mb-3">
              <div className="d-flex align-items-center">
                <FaSignal className="me-2" />
                <strong>Signal Strength</strong>
              </div>
              <div className="d-flex justify-content-between align-items-end mt-2">
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>
                    {signal ? `${signal} dB` : "—"}
                  </div>
                  <div className="muted-small">{sl.text}</div>
                </div>
                <div className="signal-meter" style={{ width: 220 }}>
                  <div
                    className="signal-fill"
                    style={{ width: `${pct}%`, backgroundColor: sl.color }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <div className="card card-rounded p-3">
              <FaGlobe className="me-2 text-info" />
              <strong>PDP Session</strong>

              <div className="mt-3">
                <div className="muted-small">Status</div>
                <div className="fw-semibold">
                  {pdpActive ? "Active" : "Not Active"}
                </div>
              </div>

              <div className="mt-2">
                <div className="muted-small">IP Address</div>
                <div className="fw-semibold">{pdpIP || "—"}</div>
              </div>

              <div className="d-grid gap-2 mt-3">
                <button
                  className="btn btn-success"
                  disabled={pdpActive}
                  onClick={handleActivatePDP}
                >
                  <FaSyncAlt className="me-2" />
                  Activate PDP
                </button>
                <button
                  className="btn btn-outline-danger"
                  disabled={!pdpActive}
                  onClick={handleDeactivatePDP}
                >
                  Deactivate PDP
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FULL WIDTH CHART */}
        <div className="card card-rounded p-4 mb-4">
          <div className="d-flex align-items-center mb-3">
            <FaSignal className="me-2 text-success" />
            <strong>Signal History</strong>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={signalHistory}>
              <XAxis dataKey="timestamp" minTickGap={30} />
              <YAxis domain={[0, 100]} unit=" dB" />
              <Tooltip formatter={(v) => [`${v} dB`, "Signal"]} />
              <Line
                type="monotone"
                dataKey="signal"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="text-end muted-small">
          Last Update: {time} {loading && "(refreshing...)"}
        </div>
      </div>
    </div>
  );
}
