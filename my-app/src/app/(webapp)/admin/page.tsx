"use client";
import React, { useMemo } from "react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bar } from "react-chartjs-2";
import DoughnutChart from "@/components/DoughnutChart";
import { useFetchDashboardData } from "@/hooks/useFetchDashboardData";
import  { monthLabels, chartOptions, getBarChartData } from "@/utils/chartUtils";
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
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    if (status === "loading") return;
  }, [session, status, router]);

  useEffect(() => {
    if (status === "loading" || !session?.user) return;

    const fetchAllData = async () => {
      try {
        let statsData,
          chartData,
          featuredData,
          userData,
          histories = [];
        let totalViewed = 0;
        let topCategory = "N/A";

        if (session?.user?.role === "admin") {
          const [statsRes, chartRes, featuredRes, usersRes, viewHistoryRes] =
            await Promise.all([
              fetch("/api/stats"),
              fetch("/api/chart-stats"),
              fetch("/api/blog/featured"),
              fetch("/api/user"),
              fetch(`/api/view-history`), 
            ]);
          [statsData, chartData, featuredData, userData, histories] =
            await Promise.all([
              statsRes.json(),
              chartRes.json(),
              featuredRes.json(),
              usersRes.json(),
              viewHistoryRes.json(),
            ]);

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
        } else {
          const userRes = await fetch(
            `/api/user/?search=${session?.user?.email}`
          );
          userData = await userRes.json();
          const userId = userData.users[0]?._id || session?.user?.id;

          const [userStatsRes, userChartRes, viewHistoryRes] =
            await Promise.all([
              fetch(`/api/stats?user=${userId}`),
              fetch(`/api/chart-stats?user=${userId}`),
              fetch(`/api/view-history?user=${userId}`),
            ]);
          statsData = await userStatsRes.json();
          chartData = await userChartRes.json();
          featuredData = { data: [] };
          histories = await viewHistoryRes.json();
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

        setUserViewStats({
          totalViewed,
          topCategory: topCategory || "N/A",
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
                  value: String(totalViewed),
                };
              case "Top Viewed Category":
                return {
                  ...stat,
                  value: topCategory || "N/A",
                };
              default:
                return stat;
            }
          })
        );

        setChartData({
          postCounts: chartData.postCounts || [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          ],
          commentCounts: chartData.commentCounts || [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          ],
        });

        if (featuredData.data) setPopularPosts(featuredData.data);
        setUsers(userData.users || []);
      } catch (error) {
        setUserViewStats({ totalViewed: 0, topCategory: "N/A" });
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    fetchAllData();
  }, [status]);

  useEffect(() => {
    if (session?.user?.role !== "admin") return;

    const fetchSelectedData = async () => {
      try {
        let statsData, chartData, featuredData, histories = [];
        let totalViewed = 0;
        let topCategory = "N/A";

        if (!selectedUserId) {
          const [statsRes, chartRes, featuredRes, viewHistoryRes] = await Promise.all([
            fetch("/api/stats"),
            fetch("/api/chart-stats"),
            fetch("/api/blog/featured"),
            fetch("/api/view-history"),
          ]);
          [statsData, chartData, featuredData, histories] = await Promise.all([
            statsRes.json(),
            chartRes.json(),
            featuredRes.json(),
            viewHistoryRes.json(),
          ]);
          
          if (featuredData.data) setPopularPosts(featuredData.data);
        } else {
          // User cụ thể
          const [userStatsRes, userChartRes, viewHistoryRes] = await Promise.all([
            fetch(`/api/stats?user=${selectedUserId}`),
            fetch(`/api/chart-stats?user=${selectedUserId}`),
            fetch(`/api/view-history?user=${selectedUserId}`),
          ]);
          [statsData, chartData, histories] = await Promise.all([
            userStatsRes.json(),
            userChartRes.json(),
            viewHistoryRes.json(),
          ]);
        }
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

        setUserViewStats({
          totalViewed,
          topCategory: topCategory || "N/A",
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
                  value: String(totalViewed),
                };
              case "Top Viewed Category":
                return {
                  ...stat,
                  value: topCategory || "N/A",
                };
              default:
                return stat;
            }
          })
        );

        setChartData({
          postCounts: chartData.postCounts || [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          ],
          commentCounts: chartData.commentCounts || [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          ],
        });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    fetchSelectedData();
  }, [selectedUserId]);

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

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const selectedUser = users.find(user => user._id === selectedUserId);

  const { newUserCount, oldUserCount, percent } = calculateUserStats();

const commentData = getBarChartData(
  monthLabels,
  chartData.commentCounts,
  "Comment",
  ["#4ade80", "#22d3ee", "#818cf8", "#fbbf24", "#f87171", "#38bdf8"]
);

const postData = getBarChartData(
  monthLabels,
  chartData.postCounts,
  "Post blog",
  ["#60a5fa", "#3b82f6"]
);
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            System Statistics
          </h1>
          {session?.user?.role === "admin" && (
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={selectedUser ? `${selectedUser.name} (${selectedUser.email})` : "All Users"}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-80 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer text-gray-700"
                  placeholder="Select user..."
                />
                <svg className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform pointer-events-none ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2 border-b border-gray-100">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedUserId("");
                        setIsDropdownOpen(false);
                        setSearchTerm("");
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                        !selectedUserId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-bold">All</span>
                        </div>
                        <span>All Users</span>
                      </div>
                    </button>
                    {filteredUsers.map((user) => (
                      <button
                        key={user._id}
                        onClick={() => {
                          setSelectedUserId(user._id);
                          setIsDropdownOpen(false);
                          setSearchTerm("");
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                          selectedUserId === user._id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-sm font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                    {filteredUsers.length === 0 && searchTerm && (
                      <div className="px-4 py-3 text-gray-500 text-center">
                        No users found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
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
  <h2 className="text-lg font-semibold text-gray-800">Post Statistics</h2>
  <div className="chart-container mt-4">
    <Bar data={postData} options={chartOptions} />
  </div>
</div>

<div className="bg-white rounded-xl shadow-md p-6 transition duration-300 card-hover">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-semibold text-gray-800">Comment Statistics</h2>
  </div>
  <div className="chart-container">
    <Bar data={commentData} options={chartOptions} />
  </div>
</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800">
                User Distribution
              </h2>
              <DoughnutChart percent={percent} />
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

      <style jsx>{`
        .chart-bar:hover {
          opacity: 0.8;
          transform: scaleY(1.05);
        }
      `}</style>
      
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsDropdownOpen(false);
            setSearchTerm("");
          }}
        />
      )}
    </div>
  );
}
