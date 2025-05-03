"use client"; // Thêm dòng này ở đầu

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

// phần còn lại giữ nguyên

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { label: "Người dùng", href: "/webapp/admin/user-management" },
    { label: "Vai trò", href: "/webapp/admin/role-management" },
  ];

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#f9f9f9" }}>
      <nav
        style={{
          display: "flex",
          gap: 16,
          padding: "16px 32px",
          background: "#1976d2",
          color: "#fff",
        }}
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              color: pathname === item.href ? "#ffeb3b" : "#fff",
              textDecoration: "none",
              fontWeight: pathname === item.href ? "bold" : "normal",
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <main style={{ padding: 32 }}>{children}</main>
    </div>
  );
}
