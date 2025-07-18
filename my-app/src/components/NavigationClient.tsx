"use client";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import UserButton from "./UserButton";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";

export default function NavigationClient() {
  const { t } = useTranslation("common"); 
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const router = useRouter();
  const navItems = [
    { label: t("User", "User"), href: "/admin/user-management" },
    { label: t("Role", "Role"), href: "/admin/role-management" },
    { label: t("Blog", "Blog"), href: "/admin/blog-management" },
    { label: t("Category", "Category"), href: "/admin/category-management" },
    { label: t("Comment", "Comment"), href: "/admin/comment-management" },
    { label: t("Document", "Document"), href: "/admin/document-management" },
  ];
  const filteredNavItems = navItems.filter((item) => {
    if (item.label === t("User", "User")) {
      return session?.user?.role === "admin";
    }
    if (item.label === t("Role", "Role")) {
      return session?.user?.role === "admin";
    }
    if (item.label === t("Category", "Category")) {
      return session?.user?.role === "admin";
    }
    if (item.label === t("Document", "Document")) {
      return session?.user?.role === "admin";
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  if (isMobile) return null;
  return (
    <nav
      style={{
        position: "relative",
        height: 64,
        display: "flex",
        gap: 16,
        padding: "16px 32px",
        background: "#1976d2",
        color: "#fff",
        alignItems: "center",
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


       .nav-home-btn {
          margin-left: auto;
          background:#fff;
          color: #1976d2;
          border: none;
          border-radius: 6px;
          padding: 8px 18px;
          font-weight: 600;
          cursor: pointer;
       }
          .nav-home-btn:hover {
          background:rgb(214, 214, 214);
          box-shadow: 0 2px 12px 0 rgba(211,47,47,0.18);
          }

               .nav-view-btn {
          margin-left: auto;
          background:#rgb(168, 155, 137);
          color: #1976d2;
          border: none;
          border-radius: 6px;
          padding: 8px 18px;
          font-weight: 600;
          cursor: pointer;
       }
          .nav-view-btn:hover {
          background:rgb(230, 231, 220);
          box-shadow: 0 2px 12px 0 rgba(211,47,47,0.18);
          }
      `}</style>

      <img
        src="/logo.png"
        alt="Logo"
        style={{ width: "auto", height: "100px", cursor: "pointer" }}
        onClick={() => router.push("/admin")}
      />
      {filteredNavItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link${isActive ? " active" : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
      <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
        <UserButton />
      </div>
    </nav>
  );
}
