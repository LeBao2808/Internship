
"use client";

import React from "react";

interface DoughnutChartProps {
  percent: number;
}

export default function DoughnutChart({ percent }: DoughnutChartProps) {
  return (
    <div className="relative w-40 h-40 mx-auto mt-4">
      {/* Track */}
      <svg width="160" height="160" className="absolute inset-0">
        <circle
          cx="80"
          cy="80"
          r="64"
          stroke="#dbeafe"
          strokeWidth="16"
          fill="none"
        />
        <circle
          cx="80"
          cy="80"
          r="64"
          stroke="url(#blue-gradient)"
          strokeWidth="16"
          fill="none"
          strokeDasharray={2 * Math.PI * 64}
          strokeDashoffset={2 * Math.PI * 64 * (1 - percent / 100)}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 1s cubic-bezier(.4,2,.6,1)",
            filter: "drop-shadow(0 2px 8px #60a5fa88)",
          }}
        />
        <defs>
          <linearGradient
            id="blue-gradient"
            x1="0"
            y1="0"
            x2="160"
            y2="160"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#3b82f6" />
            <stop offset="1" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-blue-600 drop-shadow">
          {percent}%
        </span>
        <span className="text-xs text-gray-400 mt-1">New Users</span>
      </div>
    </div>
  );
}