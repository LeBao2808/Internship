import React from "react";
import { Providers } from "./providers";
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
        <Providers>{children}</Providers>
      </main>
    </div>
  );
}
