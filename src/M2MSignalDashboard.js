import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaBroadcastTower,
  FaSignal,
  FaSatelliteDish,
  FaClock,
} from "react-icons/fa";

export default function M2MSignalDashboard() {
  const [signal, setSignal] = useState(null);
  const [satellite, setSatellite] = useState(null);
  const [time, setTime] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resSignal = await fetch("http://172.17.10.37:5000/api/m2m/signal");
        const dataSignal = await resSignal.json();
        setSignal(dataSignal.signal_strength);
        setTime(dataSignal.timestamp);

        const resSat = await fetch("http://172.17.10.37:5000/api/m2m/satellite");
        const dataSat = await resSat.json();
        setSatellite(`${dataSat.satellite_id} - ${dataSat.satellite_name}`);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const isConnected = signal !== null && !isNaN(signal);

  return (
  <div
    className="d-flex flex-column justify-content-center align-items-center vh-100"
    style={{
      background: "radial-gradient(circle at top left, #dceeff 0%, #f8fbff 100%)",
      fontFamily: "Poppins, sans-serif",
    }}
  >
    {/* ===== Header di luar card ===== */}
    <div
      className="text-center"
      style={{
        marginBottom: "25px",
      }}
    >
      <h2
        className="fw-bold text-primary"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          fontSize: "1.9rem",
          textShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <FaBroadcastTower size={30} className="text-info" />
        BGAN M2M Dashboard
      </h2>
      <small
        className="text-muted"
        style={{
          fontSize: "0.95rem",
          letterSpacing: "0.3px",
        }}
      >
        📡 Realtime Satellite Signal Monitoring
      </small>
    </div>

    {/* ===== Card utama ===== */}
    <div
      className="card shadow-lg border-0 p-4 text-center"
      style={{
        width: "460px",
        borderRadius: "25px",
        background: "white",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.02)";
        e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
      }}
    >
      {/* Connection Status */}
      <div className="mb-3">
        <span
          className="badge rounded-pill px-3 py-2"
          style={{
            backgroundColor: isConnected ? "#d4edda" : "#f8d7da",
            color: isConnected ? "#155724" : "#721c24",
            fontSize: "0.9rem",
          }}
        >
          {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </span>
      </div>

      {/* Signal Strength */}
      <div className="d-flex align-items-center justify-content-center mb-3">
        <FaSignal size={22} className="text-success me-2" />
        <div>
          <p className="mb-1 fw-semibold text-secondary">Signal Strength</p>
          <h4
            className="fw-bold"
            style={{
              color: "#2e7d32",
              textShadow: "0 0 5px rgba(46,125,50,0.3)",
            }}
          >
            {signal ? `${signal} dB` : "Loading..."}
          </h4>

          {/* Progress Bar */}
          <div
            className="progress mx-auto"
            style={{
              height: "8px",
              borderRadius: "10px",
              background: "#e9ecef",
              width: "220px",
            }}
          >
            <div
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${signal ? Math.min(signal, 100) : 0}%`,
                backgroundColor: "#4caf50",
                transition: "width 0.8s ease",
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Satellite ID */}
      <div className="d-flex align-items-center justify-content-center mb-4">
        <FaSatelliteDish size={22} className="text-primary me-2" />
        <div>
          <p className="mb-1 fw-semibold text-secondary">Satellite ID</p>
          <h5
            className="fw-bold"
            style={{
              color: "#1976d2",
              textShadow: "0 0 5px rgba(25,118,210,0.3)",
            }}
          >
            {satellite || "Loading..."}
          </h5>
        </div>
      </div>

      {/* Footer */}
      <div className="border-top pt-3 text-center">
        <FaClock className="text-muted me-2" />
        <small className="text-muted">
          Last Update: {time || "Loading..."}
        </small>

        <div className="mt-3 text-muted small">
          <span>🔗 Source: Local BGAN M2M Terminal</span>
        </div>
      </div>
    </div>
  </div>
);

}
