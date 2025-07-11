"use client";
import React, { useEffect, useState } from "react";
import UserButton from "./UserButton";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        scrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl border-b border-gray-200/30 dark:border-gray-700/30"
          : "bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200/20 dark:border-gray-700/20"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and navigation items */}
          <div className="flex items-center space-x-12">
            <div className="flex-shrink-0 group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img
                src="/logoadmin.png"
                alt="Logo"
                className="cursor-pointer block dark:hidden transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-2xl relative z-10"
                style={{ width: "80px", height: "80px" }}
                onClick={() => router.push("/")}
              />
              <img
                src="/logo.png"
                alt="Logo"
                className="cursor-pointer hidden dark:block transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-2xl relative z-10"
                style={{ width: "80px", height: "80px" }}
                onClick={() => router.push("/")}
              />
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-1">
                <Link
                  href="/category"
                  className="relative overflow-hidden group px-8 py-4 text-gray-800 dark:text-gray-200 font-semibold text-lg transition-all duration-500 hover:text-white dark:hover:text-white rounded-2xl"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-2xl"></span>
                  <span className="relative z-10 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    Category
                  </span>
                </Link>
                <a
                  href="#"
                  className="relative overflow-hidden group px-8 py-4 text-gray-800 dark:text-gray-200 font-semibold text-lg transition-all duration-500 hover:text-white dark:hover:text-white rounded-2xl"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-2xl"></span>
                  {/* <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-sm"></span> */}
                  <span className="relative z-10 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    Saves
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Right side - User button */}
          <div className="flex items-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-400/30 to-orange-400/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-110"></div>
              <div className="relative transform transition-all duration-300 ">
                <UserButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
