import React from "react";
import Footer from "../components/Footer";

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
        <Footer />
      </main>
    </div>
  );
}
