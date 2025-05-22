"use client";

import React, { useEffect } from "react";
import { useMessageStore } from "../components/messageStore";

export default function MessageToast() {
  const { message, type, show, clearMessage } = useMessageStore();
  const duration = 3000; // 3 giây

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        clearMessage();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, clearMessage]);

  if (!show) return null;

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }[type || "info"];

  return (
    <>
      <div
        className={`fixed bottom-30 right-5 z-50 w-72 rounded shadow ${bgColor} text-white`}
      >
        <div className="px-4 py-2">{message}</div>
        {/* progress bar */}
        <div className="h-1 bg-white bg-opacity-30 overflow-hidden relative">
          <div
            className="progress-bar"
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      </div>

      {/* CSS nội bộ */}
      <style jsx>{`
        .progress-bar {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 100%;
          background-color: white;
          animation-name: shrinkBar;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }

        @keyframes shrinkBar {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </>
  );
}
