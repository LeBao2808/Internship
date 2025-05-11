"use client";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useLanguage } from "../LanguageContext";
import { useTranslation } from "react-i18next";

export default function NavigationClient() {
  const pathname = usePathname();
  const { lang, setLang } = useLanguage ? useLanguage() : { lang: "vi", setLang: () => {} };
  const { t, i18n } = useTranslation ? useTranslation() : { t: (s:string)=>s, i18n: { language: "vi", changeLanguage: ()=>{} } };

  const navItems = [
    { label: t("User"), href: "/webapp/admin/user-management" },
    { label: t("Role"), href: "/webapp/admin/role-management" },
    { label: t("Blog"), href: "/webapp/admin/blog-management" },
    { label: t("Category"), href: "/webapp/admin/category-management" },
    { label: t("Home"), href: "/webapp/UI/blog" },
  ];

  return (
    <nav
      style={{
        display: "flex",
        gap: 16,
        padding: "16px 32px",
        background: "#1976d2",
        color: "#fff",
        alignItems: "center"
      }}
    >
      <style>{`
        .nav-link {
          position: relative;
          color: #fff;
          text-decoration: none;
          font-weight: 500;
          padding: 6px 18px;
          border-radius: 6px;
          transition: background 0.25s, color 0.25s, box-shadow 0.25s;
        }
        .nav-link:hover {
          background: rgba(255,255,255,0.18);
          color: #ffe082;
          box-shadow: 0 2px 12px 0 rgba(25,118,210,0.12);
        }
        .nav-link.active {
          background: #fff;
          color: #1976d2;
          font-weight: bold;
          box-shadow: 0 2px 12px 0 rgba(25,118,210,0.18);
        }
        .nav-logout-btn {
          margin-left: auto;
          background: #d32f2f;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 8px 18px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.25s, box-shadow 0.25s;
        }
        .nav-logout-btn:hover {
          background: #b71c1c;
          box-shadow: 0 2px 12px 0 rgba(211,47,47,0.18);
        }
      `}</style>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={
            "nav-link" + (pathname === item.href ? " active" : "")
          }
        >
          {item.label}
        </Link>
      ))}
      <button
        onClick={() => {
          signOut({ callbackUrl: "/webapp/admin/user-management/login", redirect:true });
          window.location.href = "https://accounts.google.com/Logout";
        }}
        className="nav-logout-btn"
      >
        {t("logout")}
      </button>
      {/* <button onClick={() => i18n.changeLanguage(i18n.language === "vi" ? "en" : "vi")}
        style={{marginLeft:8,background:"#fff",color:"#1976d2",border:"none",borderRadius:4,padding:"8px 16px",fontWeight:600,cursor:"pointer"}}>
        {i18n.language === "vi" ? "English" : "Tiếng Việt"}
      </button> */}
    </nav>
  );
}