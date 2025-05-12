import React from "react";

export default function Loader() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "rgba(255,255,255,0.7)",
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      zIndex: 9999
    }}>
      <div style={{
        border: "6px solid #e3e3e3",
        borderTop: "6px solid #1976d2",
        borderRadius: "50%",
        width: 48,
        height: 48,
        animation: "spin 1s linear infinite"
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}