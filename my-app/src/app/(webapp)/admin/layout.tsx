import React from "react";
import NavigationClient from "./NavigationClient";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#f9f9f9" }}>
      <NavigationClient />
      <main style={{ padding: 32 }}>{children}</main>
    </div>
  );
}
