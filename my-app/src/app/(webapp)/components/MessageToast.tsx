"use client";

import React, { useEffect } from "react";
import { useState } from "react";
import { useMessageStore } from "../components/messageStore";

export default function MessageToast() {
  const { message, type, show, clearMessage } = useMessageStore();
  const duration = 3000;

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
        className={`fixed bottom-5 right-5 z-50 w-72 rounded shadow ${bgColor} text-white`}
      >
        <div className="flex justify-between items-center">
          <div className="px-4 py-2">{message}</div>
          {/* <button onClick={() => setVisible(false)} className="">
            X
          </button> */}
        </div>

        {/* progress bar */}
        <div
          className={`h-1 ${bgColor} bg-opacity-30 overflow-hidden relative`}
        >
          <div
            className="absolute left-0 top-0 h-full bg-white"
            style={{
              width: "100%",
              animationName: "shrinkBar",
              animationDuration: `${duration}ms`,
              animationTimingFunction: "linear",
              animationFillMode: "forwards",
            }}
          />
        </div>
      </div>

      <style>{`
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
