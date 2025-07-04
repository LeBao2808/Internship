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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50"
          : "bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and navigation items */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <img
                src="/logoadmin.png"
                alt="Logo"
                className="cursor-pointer block dark:hidden"
                style={{ width: "auto", height: "100px" }}
                onClick={() => router.push("/")}
              />
              <img
                src="/logo.png"
                alt="Logo"
                className="cursor-pointer hidden dark:block"
                style={{ width: "auto", height: "100px" }}
                onClick={() => router.push("/")}
              />
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/category"
                  className="text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 rounded-lg text-base font-semibold transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  Category
                </Link>
                <a
                  href="#"
                  className="text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 rounded-lg text-base font-semibold transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  Saves
                </a>
              </div>
            </div>
          </div>

          {/* Right side - User button */}
          <div className="flex items-right ">
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
