"use client"
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      style={{
        fontFamily: "sans-serif",
        minHeight: "100vh",
      }}
      className="dark:bg-[#121618] dark:text-white"
    >
      <main className="dark:bg-[#121618]">
        <SessionProvider>{children}</SessionProvider>
      </main>
    </div>
  );
}
