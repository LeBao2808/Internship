"use client";

import React from "react";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import HomeMobile from "../home-mobile/page";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaUser, FaUserShield, FaBlog, FaList } from "react-icons/fa";
export default function MobileSlideUp() {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);

  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { t, i18n } = useTranslation
    ? useTranslation()
    : {
        t: (s: string) => s,
        i18n: { language: "vi", changeLanguage: () => {} },
      };

  const navItems = [
    {
      label: t("User"),
      href: "/admin/user-management",
      icon: <FaUser className="absolute bottom-[11px]" />,
    },
    {
      label: t("Role"),
      href: "/admin/role-management",
      icon: <FaUserShield className="absolute bottom-[11px]" />,
    },
    {
      label: t("Blog"),
      href: "/admin/blog-management",
      icon: <FaBlog className="absolute bottom-[11px]" />,
    },
    {
      label: t("Category"),
      href: "/admin/category-management",
      icon: <FaList className="absolute bottom-[11px]" />,
    },
    // { label: t("Home"), href: "/UI/blog", icon: <FaHome /> },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);
  //   useEffect(() => {
  //     if (isOpen) {
  //       setShouldRender(true);
  //     } else {
  //       // Delay để chạy animation trượt xuống rồi mới unmount
  //       const timer = setTimeout(() => setShouldRender(false), 3000); // khớp với transition time
  //       return () => clearTimeout(timer);
  //     }
  //   }, [isOpen]);
  if (!isMobile) return null;
  console.log("menuref", menuRef.current);
  return (
    <>
      <div
        ref={menuRef}
        className="hover:shadow-lg transition-all duration-300 ease-in-out"
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          width: 64,
          height: 64,
          borderRadius: "100%",
          background: "#1976d2",
          padding: "0 3px",
        }}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: "100%" }}
              // exit={{ y: "100%" }}
              transition={{ duration: 0.1 }}
              style={{
                position: "fixed",
                bottom: 90,
                right: 30,
                width: "200px",
                // height: "25%", // Change from "100%" to "60%"
                backgroundColor: "#fff",
                padding: "16px",
                borderRadius: "12px",
                boxShadow: "rgb(12 2 2 / 31%) 0px -2px 12px",
                zIndex: 100,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* <button
                className="hover:shadow-lg transition-all duration-300 ease-in-out"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  padding: "8px",
                  borderRadius: "50%",
                  color: "black",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              ></button> */}

              {/* <HomeMobile onSelect={() => setIsOpen(false)} /> */}

              {navItems.map((item, index) => (
                <a
                  className={`nav-link-mobile ${
                    pathname === item.href ? "active" : null
                  } `}
                  key={index}
                  href={item.href}
                >
                  <span style={{ marginRight: 8 }}>{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <img
          onClick={() => setIsOpen(!isOpen)}
          src="/logo.png"
          alt="Logo"
          style={{
            width: "100%",
            height: "100%",
            cursor: "pointer",
            objectFit: "contain",
            zIndex: 99,
          }}
        />
      </div>
    </>
  );
}
