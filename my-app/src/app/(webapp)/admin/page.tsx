"use client";
import React from "react";
// import Link from "next/link";

export default function AdminHomePage() {
  // Giả lập số liệu, bạn có thể thay bằng fetch API thực tế nếu muốn động
  const stats = [
    { label: "Total Posts", value: 152 },
    { label: "Users", value: 4789 },
    { label: "Comments", value: 1365 },
  ];

  return (
    <div
      style={{
        width: "100%",
        padding: 32,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 8px #eee",
      }}
      className="min-h-screen"
    >
      {/* Thống kê */}
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: "#1976d2",
          marginBottom: 24,
        }}
        className="flex justify-center items-center"
      >
        WELCOME TO DEVBLOG
      </h1>
      <div
        style={{
          display: "flex",
          gap: 96,
          justifyContent: "center",
          marginBottom: 40,
        }}
      >
        {stats.map((item, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              minWidth: 180,
              background: "#f5f7fa",
              borderRadius: 16,
              boxShadow: "0 2px 12px #e3e8f7",
              padding: "28px 0",
              textAlign: "center",
              transition: "box-shadow 0.2s",
              maxWidth: 300,
            }}
          >
            <div style={{ fontSize: 18, color: "#555", marginBottom: 8 }}>
              {item.label}
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "#5b4ee2",
                letterSpacing: 1,
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
