"use client";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        fontFamily: "sans-serif",
        minHeight: "100vh",
      }}
    >
      <main style={{}}>
        <div className="w-full items-center justify-center">{children}</div>
      </main>
    </div>
  );
}
