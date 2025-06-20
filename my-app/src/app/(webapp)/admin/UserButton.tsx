"use client";
import { useSession } from "next-auth/react";
import React, { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import "../../(webapp)/components/userButton.css";

export default function UserButton() {
  const { data: session, status } = useSession();
  const [show, setShow] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const imageUrl = "/BlueHead.png";
  const router = useRouter();
  const pathname = usePathname();
  const isOnAdminPage = pathname.startsWith("/admin");
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShow(false);
      }
    }
    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show]);

  if (status === "loading") {
    return null;
  }

  if (!session) {
    return (
      <a
        href="/authen/login"
        className="px-5 py-2 text-blue-600 font-medium border border-blue-600 rounded-full hover:bg-blue-50 transition-all bg-white"
      >
        Log in
      </a>
    );
  }

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      ref={dropdownRef}
    >
      <button
        style={{
          width: "100%",
          borderRadius: 4,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 12,
          border: "none",
          background: "none",
          color: "#333",
          transition: "background 0.3s ease-in-out",
        }}
        onClick={() => setShow((prev) => !prev)}
      >
        <p
          style={{
            fontFamily: "cursive",
          }}
          className={`text-nav-btn-user mr-5 ${
            isOnAdminPage ? "text-white" : "text-black"
          }`}
        >
          {session?.user?.name}
        </p>
        <Image
          src={session?.user?.image || imageUrl}
          alt={session?.user?.name || "User"}
          width={40}
          height={40}
          style={{ width: 40, height: 40 }}
          className="rounded-full mr-4 w-[40px] h-[40px] object-cover image-userbutton"
        />
      </button>
      {show && (
        <div
          className="
      absolute top-[70%] right-0 min-w-[200px] bg-white border border-gray-200 rounded-md 
      shadow-xl z-50 py-2 px-2 
      opacity-0 translate-y-4 scale-95 
      animate-dropdown-enter
      pointer-events-none
      user-btn
    "
        >
          <button
            style={{ marginTop: 12, width: "100%" }}
            className="nav-view-btn"
            onClick={() => {
              if (isOnAdminPage) {
                router.push("/UI/blog");
              } else {
                if (session?.user) {
                  router.push("/admin/blog-management");
                }
              }
            }}
          >
            {isOnAdminPage ? "Go to Blog" : "Blog Management"}
          </button>

          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              signOut({ callbackUrl: "/UI/blog", redirect: true });
            }}
            className="nav-logout-btn"
            style={{ marginTop: 12, width: "100%" }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
