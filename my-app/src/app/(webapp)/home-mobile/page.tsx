// pages/index.tsx
"use client";
import Link from "next/link";
import Head from "next/head";
import React from "react";
import { useRouter } from "next/navigation";
export default function HomeMobile() {
  const router = useRouter();

  const pages = [
    { label: "User", href: "/admin/user-management" },
    { label: "Role", href: "/admin/role-management" },
    { label: "Blog", href: "/admin/blog-management" },
    { label: "Category", href: "/admin/category-management" },
  ];

  return (
    <div className="w-full ">
      <Head>
        <title>{"Home"}</title>
      </Head>
      <main className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 ">
        <div className="flex flex-col items-center mb-8">
          <div
            className="bg-white shadow-lg rounded-full p-2 mb-3 hover:shadow-xl transition-shadow duration-200 cursor-pointer glow-animate"
            onClick={() => router.push("/admin")}
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="w-24 h-24 object-contain bg-cyan-700 rounded-full "
            />
          </div>
          {/* <h1 className="text-4xl font-extrabold text-blue-700 drop-shadow-lg text-center tracking-tight">
            {t("Admin Dashboard")}
          </h1> */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md mx-auto">
          {pages.map((page) => (
            <Link
              href={page.href}
              key={page.href}
              className="p-6 bg-white/80 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 border-2 border-blue-200 rounded-2xl flex items-center justify-center group"
            >
              <span className="text-lg font-semibold text-blue-700 group-hover:text-blue-900 transition-colors duration-200">
                {page.label}
              </span>
            </Link>
          ))}
        </div>
      </main>
      <style jsx global>{`
        .blog-home-bg {
          background: linear-gradient(
            to right,
            rgb(255, 228, 230),
            rgb(204, 251, 241)
          );
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
