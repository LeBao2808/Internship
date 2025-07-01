"use client";
import React, { useMemo } from "react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bar } from "react-chartjs-2";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminHomePage() {
  const [users, setUsers] = useState<any[]>([]);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState([
    {
      label: "Total Posts",
      value: "0",
      change: "+0%",
      isPositive: true,
      icon: "📝",
    },
    {
      label: "Total Comments",
      value: "0",
      change: "-0%",
      isPositive: false,
      icon: "💬",
    },
    {
      label: "Blogs Viewed",
      value: "0",
      change: "+0%",
      isPositive: true,
      icon: "👁️",
    },
    {
      label: "Top Viewed Category",
      value: "N/A",
      change: "",
      isPositive: true,
      icon: "🏷️",
    },
  ]);
  const [popularPosts, setPopularPosts] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{
    postCounts: number[];
    commentCounts: number[];
  }>({
    postCounts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    commentCounts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  });

  // Thêm state cho thống kê view của user
  const [userViewStats, setUserViewStats] = useState({
    totalViewed: 0,
    topCategory: "",
  });
  useEffect(() => {
    if (status === "loading") return;
  }, [session, status, router]);

  useEffect(() => {
    if (status === "loading" || !session?.user) return;

    const fetchAllData = async () => {
      try {
        let statsData, chartData, featuredData, userData, histories = [];
        let totalViewed = 0;
        let topCategory = "N/A";

        if (session?.user?.role === "admin") {
          const [statsRes, chartRes, featuredRes, usersRes] = await Promise.all([
            fetch("/api/stats"),
            fetch("/api/chart-stats"),
            fetch("/api/blog/featured"),
            fetch("/api/user"),
          ]);
          [statsData, chartData, featuredData, userData] = await Promise.all([
            statsRes.json(),
            chartRes.json(),
            featuredRes.json(),
            usersRes.json(),
          ]);
        } else {

          const userRes = await fetch(`/api/user/?search=${session?.user?.email}`);
          userData = await userRes.json();
          const userId = userData.users[0]?._id || session?.user?.id;

          const [userStatsRes, userChartRes, viewHistoryRes] = await Promise.all([
            fetch(`/api/stats?user=${userId}`),
            fetch(`/api/chart-stats?user=${userId}`),
            fetch(`/api/view-history?user=${userId}`),
          ]);
          statsData = await userStatsRes.json();
          chartData = await userChartRes.json();
          featuredData = { data: [] };
          histories = await viewHistoryRes.json();

          // Xử lý thống kê view
          totalViewed = histories.length;
          const categoryCount: Record<string, number> = {};
          histories.forEach((h: any) => {
            const catName =
              typeof h.blog === "object" &&
              h.blog.category &&
              typeof h.blog.category === "object"
                ? h.blog.category.name
                : undefined;
            if (catName)
              categoryCount[catName] = (categoryCount[catName] || 0) + 1;
          });
          let max = 0;
          Object.entries(categoryCount).forEach(([cat, count]) => {
            if (count > max) {
              topCategory = cat;
              max = count;
            }
          });
        }

        // Cập nhật thống kê view cho user thường
        setUserViewStats({
          totalViewed: session?.user?.role === "admin" ? 0 : totalViewed,
          topCategory: session?.user?.role === "admin" ? "N/A" : topCategory || "N/A",
        });

        setStats((prev) =>
          prev.map((stat) => {
            switch (stat.label) {
              case "Total Posts":
                return {
                  ...stat,
                  value: statsData.totalPosts?.toLocaleString() || "0",
                };
              case "Total Comments":
                return {
                  ...stat,
                  value: statsData.totalComments?.toLocaleString() || "0",
                };
              case "Blogs Viewed":
                return {
                  ...stat,
                  value: String(
                    session?.user?.role === "admin"
                      ? 0
                      : totalViewed
                  ),
                };
              case "Top Viewed Category":
                return {
                  ...stat,
                  value:
                    session?.user?.role === "admin"
                      ? "N/A"
                      : topCategory || "N/A",
                };
              default:
                return stat;
            }
          })
        );

        setChartData({
          postCounts: chartData.postCounts || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          commentCounts: chartData.commentCounts || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        });

        if (featuredData.data) setPopularPosts(featuredData.data);
        setUsers(userData.users || []);
      } catch (error) {
        setUserViewStats({ totalViewed: 0, topCategory: "N/A" });
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    fetchAllData();
  }, [status, session]);

  const calculateUserStats = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let newUserCount = 0;
    let oldUserCount = 0;

    users.forEach((user) => {
      const createdAt = new Date(user.createdAt);
      if (createdAt >= oneWeekAgo) {
        newUserCount++;
      } else {
        oldUserCount++;
      }
    });

    const total = newUserCount + oldUserCount;
    const percent = total ? Math.round((newUserCount / total) * 100) : 0;

    return { newUserCount, oldUserCount, percent };
  };

  const latestPosts = useMemo(() => popularPosts.slice(0, 3), [popularPosts]);

  const renderDoughnutChart = (percent: number) => (
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
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-blue-600 drop-shadow">
          {percent}%
        </span>
        <span className="text-xs text-gray-400 mt-1">New Users</span>
      </div>
      {/* Legend */}
    </div>
  );

  const { newUserCount, oldUserCount, percent } = calculateUserStats();

  const monthLabels = [
    "Th1",
    "Th2",
    "Th3",
    "Th4",
    "Th5",
    "Th6",
    "Th7",
    "Th8",
    "Th9",
    "Th10",
    "Th11",
    "Th12",
  ];

  const commentData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Bình luận",
        data: chartData.commentCounts,
        backgroundColor: [
          "#4ade80",
          "#22d3ee",
          "#818cf8",
          "#fbbf24",
          "#f87171",
          "#38bdf8",
          "#4ade80",
          "#22d3ee",
          "#818cf8",
          "#fbbf24",
          "#f87171",
          "#38bdf8",
        ],
        borderRadius: 8,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            System Statistics
          </h1>
        </header>

        <main className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">{stat.label}</p>
                    <h3
                      className={`text-3xl font-bold ${
                        stat.label.includes("Posts")
                          ? "text-blue-600"
                          : stat.label.includes("Comments")
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {stat.value}
                    </h3>
                    <p
                      className={`text-sm ${
                        stat.isPositive ? "text-green-500" : "text-red-500"
                      } mt-1`}
                    >
                      {stat.change} compared to last month
                    </p>
                  </div>
                  <div className="text-2xl">{stat.icon}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Post Statistics
              </h2>
              <div className="chart-container mt-4">
                <Bar
                  data={{
                    labels: monthLabels,
                    datasets: [
                      {
                        label: "Bài viết",
                        data: chartData.postCounts, 
                        backgroundColor: [
                          "#60a5fa",
                          "#3b82f6",
                          "#60a5fa",
                          "#3b82f6",
                          "#60a5fa",
                          "#3b82f6",
                          "#60a5fa",
                          "#3b82f6",
                          "#60a5fa",
                          "#3b82f6",
                          "#60a5fa",
                          "#3b82f6",
                        ],
                        borderRadius: 8,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                      tooltip: { enabled: true },
                    },
                    scales: {
                      y: { beginAtZero: true },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 transition duration-300 card-hover">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Comment Statistics
                </h2>
              </div>
              <div className="chart-container">
                <Bar data={commentData} options={options} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800">
                User Distribution
              </h2>
              {renderDoughnutChart(percent)}
              <div className="flex justify-center mt-4 space-x-4 text-sm">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                  <span>
                    New ({newUserCount} account{newUserCount !== 1 ? "s" : ""})
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-blue-200 mr-1"></span>
                  <span>
                    Old ({oldUserCount} account{oldUserCount !== 1 ? "s" : ""})
                  </span>
                </div>
              </div>
            </div>

            {/* Popular Posts */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Popular Posts
              </h2>
              <div className="space-y-4">
                {latestPosts.map((post, index) => (
                  <div key={post._id} className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-2.5 py-0.5 rounded-full mr-3">
                      #{index + 1}
                    </span>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {post.views?.toLocaleString() ?? 0} views •{" "}
                        {post.comments ?? 0} comments
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* CSS custom for special components */}
      <style jsx>{`
        .chart-bar:hover {
          opacity: 0.8;
          transform: scaleY(1.05);
        }
      `}</style>
    </div>
  );
}
