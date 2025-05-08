"use client"; // Thêm dòng này ở đầu

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

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
    { label: "Blog", href: "/webapp/admin/blog-management" },
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
        <button
          onClick={() => {
            signOut({ callbackUrl: "/webapp/admin/user-management/login", redirect:true });
            // window.location.href = "https://accounts.google.com/Logout";
          }}
          style={{
            marginLeft: "auto",
            background: "#d32f2f",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "8px 16px",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Đăng xuất
        </button>
      </nav>
      <main style={{ padding: 32 }}>{children}</main>
    </div>
  );
}
