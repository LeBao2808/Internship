"use client";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
// import { signOut } from "next-auth/react";
// import { useLanguage } from "../LanguageContext";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
// import { CiLogin } from "react-icons/ci";
import UserButton from "./UserButton";
import { useEffect, useState } from "react";

export default function NavigationClient() {
  const pathname = usePathname();

  // const { lang, setLang } = useLanguage
  //   ? useLanguage()
  //   : { lang: "vi", setLang: () => {} };

  const router = useRouter();
  const navItems = [
    { label: "User", href: "/admin/user-management" },
    { label: "Role", href: "/admin/role-management" },
    { label: "Blog", href: "/admin/blog-management" },
    { label: "Category", href: "/admin/category-management" },
    { label: "Comment", href: "/admin/comment-management" },
    // { label: t("Home"), href: "/UI/blog" },
  ];
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
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={"nav-link" + (pathname === item.href ? " active" : "")}
        >
          {item.label}
        </Link>
      ))}
      <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
        {/* <button
          onClick={() => {
            router.push("/UI/blog");
          }}
          className="nav-home-btn"
        >
          Visit your blog
        </button> */}
        <UserButton />

        {/* <button
          onClick={() => {
            signOut({ callbackUrl: "/authen/login", redirect:true });
            // window.location.href = "https://accounts.google.com/Logout";
          }}
          className="nav-logout-btn"
        >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
</svg>


        </button> */}
      </div>
      {/* <button onClick={() => i18n.changeLanguage(i18n.language === "vi" ? "en" : "vi")}
        style={{marginLeft:8,background:"#fff",color:"#1976d2",border:"none",borderRadius:4,padding:"8px 16px",fontWeight:600,cursor:"pointer"}}>
        {i18n.language === "vi" ? "English" : "Tiếng Việt"}
      </button> */}
    </nav>
  );
}
