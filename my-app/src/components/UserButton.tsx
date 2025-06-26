"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoLanguage } from "react-icons/io5";
import { MdOutlineLightMode, MdDarkMode } from "react-icons/md";
import { FaBlog, FaHome, FaSignOutAlt } from "react-icons/fa";
import { RiLoginBoxFill } from "react-icons/ri";
import { FaPaintbrush } from "react-icons/fa6";
import { useTranslation } from "next-i18next";
import i18n from "@/app/i18n";
export default function UserButton() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathnameRaw = usePathname();
  const pathname = pathnameRaw || "/";
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isOnAdminPage = pathname.startsWith("/admin");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en");
  const { t } = useTranslation("common");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    let isDark = false;
    if (savedTheme === "dark") {
      isDark = true;
    } else if (!savedTheme) {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      console.log(document.documentElement.className);
      return newMode;
    });
  };

  if (status === "loading") return null;

  const userImage = session?.user?.image || "/BlueHead.png";
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "user@example.com";

  return (
    <div className="relative user-dropdown" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown((prev) => !prev)}
        className="flex items-center gap-2 pl-2 pr-4 py-2 rounded-full cursor-pointer transition-shadow"
      >
        <div className="relative">
          <Image
            src={userImage}
            alt="User"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover border-2 border-blue-400"
          />
          {session?.user ? (
            <span className="notification-dot absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          ) : null}
        </div>
        <i
          className={`fas fa-chevron-down text-gray-500 text-xs transition-transform duration-200 ${
            showDropdown ? "rotate-180" : ""
          }`}
        ></i>
      </button>

      <div
        className={`dropdown-content absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-lg overflow-visible z-50 shadow-xl ${
          showDropdown
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible translate-y-4"
        } transition-all duration-300 ease-in-out`}
      >
        <div
          className={`px-4 py-3 ${
            isOnAdminPage ? " dark:bg-gray-900" : "bg-white dark:bg-gray-900"
          }  from-blue-50 to-indigo-50 border-b border-gray-200 dark:border-gray-700 `}
        >
          <div className="flex items-center gap-3">
            <Image
              src={userImage}
              alt="User"
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {userName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {userEmail}
              </p>
            </div>
          </div>
        </div>

        <div className="py-1">
          {isOnAdminPage ? (
            <Link
              href="/"
              className="menu-item flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FaHome className="text-purple-500 w-5" />
              <span>{t("home")}</span>
            </Link>
          ) : session?.user ? (
            <Link
              href="/admin/blog-management"
              className="menu-item flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FaBlog className="text-purple-500 w-5" />
              <span>{t("blogManagement")}</span>
            </Link>
          ) : null}

          <div
            className="menu-item flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <IoLanguage className="text-orange-500 w-5" />
         <span>{selectedLang === "en" ? t("English") : t("Vietnamese")}</span>
          </div>

          {isOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10 py-1">
              <button
                className={`block w-full text-left px-4 py-2 text-sm ${
                  selectedLang === "en"
                    ? "bg-orange-50 dark:bg-gray-800 text-orange-700"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => {
                  setSelectedLang("en");
                  const newPath = pathname.replace(/^\/(vi|en)/, "/en");
                  i18n.changeLanguage("en");
                  router.push(newPath, { scroll: false });
                  setIsOpen(false);
                }}
              >
                {t("English")}
              </button>
              <button
                className={`block w-full text-left px-4 py-2 text-sm ${
                  selectedLang === "vi"
                    ? "bg-orange-50 dark:bg-gray-800 text-orange-700"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => {
                  setSelectedLang("vi");
                  const newPath = pathname.replace(/^\/(vi|en)/, "/vi");
                  i18n.changeLanguage("vi");
                  router.push(newPath, { scroll: false });
                  setIsOpen(false);
                }}
              >
                {t("Vietnamese")}
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {!isOnAdminPage && (
          <>
            <div className="py-1">
              {!session?.user ? (
                <Link
                  href="/login"
                  className="menu-item flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <RiLoginBoxFill className="text-green-500 w-5 text-2xl" />
                  <span>{t("login")}</span>
                </Link>
              ) : null}
              <div className="menu-item flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <FaPaintbrush className="text-blue-500 w-5" />
                <span>{t("theme")}</span>
                {/* Toggle Switch */}
                <label className="inline-flex items-center ml-auto">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isDarkMode}
                    onChange={toggleTheme}
                  />
                  <div className="relative w-14 h-7 bg-white border-gray-2  00 border dark:bg-gray-800 rounded-full peer peer-checked:bg-black transition-colors duration-300 cursor-pointer">
                    <div
                      className={`absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center w-5 h-5 transition-all duration-300 ${
                        isDarkMode ? "left-8 text-white" : "left-1 text-yellow-400"
                      }`}
                    >
                      {isDarkMode ? (
                        <MdDarkMode className="w-4 h-4" />
                      ) : (
                        <MdOutlineLightMode className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {session?.user ? (
          <Link
            href="/api/auth/logout"
            onClick={(e) => {
              e.preventDefault();
              fetch("/api/auth/logout", { method: "POST" }).then(() => {
                router.push("/");
              });
            }}
            className="menu-item flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FaSignOutAlt className="text-red-500 w-5" />
            <span>{t("logout")}</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
