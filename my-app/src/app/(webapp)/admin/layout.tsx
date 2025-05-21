"use client"
import React from "react";
import NavigationClient from "./NavigationClient";
import { SessionProvider } from "next-auth/react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
  
      <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#f9f9f9" }}>
        <NavigationClient />
        <main style={{ padding: 32 }}>
            {children}
        </main>
      </div>

    </SessionProvider>
  );
}
