"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useLanguage } from "../LanguageContext";
import { useTranslation } from "react-i18next";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { lang, setLang } = useLanguage();
  const { t, i18n } = useTranslation();

  const navItems = [
    { label: t("User"), href: "/webapp/admin/user-management" },
    { label: t("Role"), href: "/webapp/admin/role-management" },
    { label: t("Blog"), href: "/webapp/admin/blog-management" },
    { label: t("Home"), href: "/webapp/UI/blog" },
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
            window.location.href = "https://accounts.google.com/Logout";
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
          {t("logout")}
        </button>

        <button onClick={() => i18n.changeLanguage(i18n.language === "vi" ? "en" : "vi")}>
          {i18n.language === "vi" ? "English" : "Tiếng Việt"}
        </button>
      </nav>
      <main style={{ padding: 32 }}>{children}</main>
    
    </div>
  );
}
