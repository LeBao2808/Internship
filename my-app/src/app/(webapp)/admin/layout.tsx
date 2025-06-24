"use client";
import React from "react";
import NavigationClient from "../../../components/NavigationClient";
import { SessionProvider } from "next-auth/react";
import MobileSlideUp from "../../../components/MobileSlideUp";
import MessageToast from "../../../components/MessageToast";
import "../../../styles/admin.css"; 

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div
        style={{
          fontFamily: "sans-serif",
          minHeight: "100vh",
          background: "#f9f9f9",
        }}
      >
        <NavigationClient />
        <main style={{ padding: 32 }}>
          <div className="w-full items-center justify-center">
            {children}
            <MessageToast />
          </div>
        </main>
        <MobileSlideUp />
      </div>
    </SessionProvider>
  );
}
