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
              <h3 className="mb-0 fw-bold">BGAN M2M</h3>
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

        {/* SIGNAL HISTORY + SIGNAL STRENGTH */}
        <div className="card card-rounded p-4 mb-4">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 260px",
              gap: 20,
              alignItems: "center",
            }}
          >
            {/* LEFT - CHART */}
            <div>
              <div className="d-flex align-items-center mb-3">
                <FaSignal className="me-2 text-success" />
                <strong>Signal History</strong>
              </div>

              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={signalHistory}>
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(v) => v.slice(11, 19)} // HH:MM:SS
                    minTickGap={40}
                  />
                  <YAxis
                    domain={[
                      (min) => Math.floor(min - 1),
                      (max) => Math.ceil(max + 1),
                    ]}
                    unit=" dB"
                  />
                  <Tooltip
                    labelFormatter={(l) => `Time: ${l.slice(11, 19)}`}
                    formatter={(v) => [`${v} dB`, "Signal"]}
                  />
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

            {/* RIGHT - SIGNAL STRENGTH */}
            <div>
              <div className="card card-rounded p-3 mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaSignal className="me-2 text-success" />
                  <strong>Signal Strength</strong>
                </div>

                <div style={{ fontSize: 32, fontWeight: 700 }}>
                  {signal !== null && !isNaN(signal) ? `${signal} dB` : "—"}
                </div>

                <div
                  className="fw-semibold"
                  style={{ color: sl.color, marginBottom: 8 }}
                >
                  {sl.text}
                </div>

                {/* optional: thin indicator bar */}
                <div
                  style={{
                    height: 6,
                    width: "100%",
                    background: "#e5e7eb",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      height: "100%",
                      background: sl.color,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DEVICE & NETWORK */}
        <div className="card card-rounded p-3 mb-4">
          <div className="d-flex align-items-center mb-2">
            <FaSatelliteDish className="me-2 text-primary" />
            <strong>Device & Network</strong>
          </div>

          <div className="row">
            <div className="col-6 mb-2">
              <div className="muted-small">Satellite</div>
              <div className="fw-semibold">{satellite}</div>
            </div>

            <div className="col-6 mb-2">
              <div className="muted-small">IMEI</div>
              <div className="fw-semibold">{imei}</div>
            </div>

            <div className="col-6 mb-2">
              <div className="muted-small">IMSI</div>
              <div className="fw-semibold">{imsi}</div>
            </div>

            <div className="col-6 mb-2">
              <div className="muted-small">Network Status</div>
              <div className={`fw-semibold ${NETWORK_COLORS[network]}`}>
                {network}
              </div>
            </div>
          </div>
        </div>

        {/* CONNECTION & APN */}
        <div className="card card-rounded p-4 mb-4">
          <div className="d-flex align-items-center mb-3">
            <FaGlobe className="me-2 text-info" />
            <strong>Connection & APN</strong>
          </div>

          {/* PDP SESSION */}
          <div className="mb-4">
            <div className="muted-small">PDP Status</div>
            <div className="fw-semibold mb-1">
              {pdpActive ? "Active" : "Not Active"}
            </div>
            <div className="muted-small">IP Address</div>
            <div className="fw-semibold mb-2">{pdpIP || "—"}</div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-success btn-sm"
                disabled={pdpActive}
                onClick={handleActivatePDP}
              >
                <FaSyncAlt className="me-2" />
                Activate PDP
              </button>
              <button
                className="btn btn-outline-danger btn-sm"
                disabled={!pdpActive}
                onClick={handleDeactivatePDP}
              >
                Deactivate PDP
              </button>
            </div>
          </div>

          {/* APN PROFILES */}
          <strong className="mb-2 d-block">📡 APN Profiles</strong>
          <table className="table table-sm apn-table mb-3">
            <thead>
              <tr>
                <th>CID</th>
                <th>Type</th>
                <th>APN</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {apnList.length ? (
                apnList.map((p, i) => (
                  <tr key={i}>
                    <td>{p.cid}</td>
                    <td>{p.type}</td>
                    <td>{p.apn}</td>
                    <td>{p.address}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No APN configured
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* APN SETTINGS */}
          <strong className="mb-2 d-block">⚙️ APN Settings</strong>
          <div className="d-flex flex-column gap-2">
            <input
              className="form-control form-control-sm"
              placeholder="APN Name"
              value={newAPN}
              onChange={(e) => setNewAPN(e.target.value)}
            />
            <input
              className="form-control form-control-sm"
              placeholder="Username"
              value={apnUser}
              onChange={(e) => setApnUser(e.target.value)}
            />
            <input
              type="password"
              className="form-control form-control-sm"
              placeholder="Password"
              value={apnPass}
              onChange={(e) => setApnPass(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" onClick={handleSetAPN}>
              Save APN (Store Only)
            </button>
          </div>
        </div>

        <div className="text-end muted-small">
          Last Update: {time} {loading && "(refreshing...)"}
        </div>
      </div>
    </div>
  );
}
