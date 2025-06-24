"use client";
import React from "react";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
      }}
    >
      <div
        style={{
          minWidth: 350,
          width: "100%",
          borderRadius: 16,
          background: "#fff",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}