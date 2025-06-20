"use client"
import { SessionProvider } from "next-auth/react";
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
      <main>
        <SessionProvider>{children}</SessionProvider>
      </main>
    </div>
  );
}
