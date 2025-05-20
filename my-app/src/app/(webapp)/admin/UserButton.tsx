"use client";
import { useSession } from "next-auth/react";
import React, { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";

export default function UserButton() {
  const { data: session, status } = useSession();
  const [show, setShow] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
const imageUrl = 'https://www.google.com/url?sa=i&url=https%3A%2F%2Flasucomputerscience.com%2Fxlasu%2Ffaculties%2Ffaculty.php%3Fid%3D16&psig=AOvVaw1AGntHOW-1HuJFhS_rzTdX&ust=1747793387203000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCLDgk_L7sI0DFQAAAAAdAAAAABAE';
  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  if (status === "loading") return null;
  if (!session) return null;

  return (
    <div style={{ position: "relative", display: "inline-block" }} ref={dropdownRef} >
      <button
        style={{ width: "100%", borderRadius: 4, cursor: "pointer" }}
        onClick={() => setShow((prev) => !prev)}
      >
        {/* {session.user?.name || session.user?.email} */}
        <img
  src={session?.user?.image || imageUrl }
  alt={session?.user?.name || 'User'}
  width={40}
  height={40}
  className="rounded-full"
/>
      </button>
      {show && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            right: 0,
            minWidth: 200,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            zIndex: 100,
            padding: 12,
          }}
        >
          {/* <strong>Tên user:</strong> {session.user?.name || session.user?.email} */}
          <button 
              style={{ marginTop: 12, width: "100%" }} className="nav-view-btn"
          >View Detail</button>
          <button
            onClick={() => {
              signOut({ callbackUrl: "/authen/login", redirect: true });
            }}
            className="nav-logout-btn"
            style={{ marginTop: 12, width: "100%" }}
          >
            {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{ width: 20, height: 20, verticalAlign: "middle", marginRight: 8 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg> */}
            Logout
          </button>
        </div>
      )}
    </div>
  );
}