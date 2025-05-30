"use client";
import React from "react";
import NavigationClient from "./NavigationClient";
import { SessionProvider } from "next-auth/react";
import MobileSlideUp from "./MobileSlideUp";
import MessageToast from "../components/MessageToast";

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
