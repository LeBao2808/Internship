"use client";
import React, { useMemo } from "react";
import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation";

interface Blog {
  _id: string;
  title: string;
  content: string;
  image_url?: string;
  user?: string | { _id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
  category?: string | { _id: string; name: string };
  featured?: boolean;
  slug?: string;
}


export default function AdminHomePage() {

const [users, setUsers] = useState<any[]>([]);
const router = useRouter();
const { data: session, status } = useSession();
const [loadingUsers, setLoadingUsers] = useState(true);
  const [stats, setStats] = useState([
    { label: "Total Posts", value: "0", change: "+0%", isPositive: true, icon: "📝" },
    { label: "Total Comments", value: "0", change: "-0%", isPositive: false, icon: "💬" },
    { label: "Users", value: "0", change: "+0%", isPositive: true, icon: "👥" },
    { label: "Engagement Rate", value: "0%", change: "+0%", isPositive: true, icon: "❤️" }
  ]);

const [popularPosts, setPopularPosts] = useState<any[]>([]);
const [loadingPopular, setLoadingPopular] = useState(true);
  const [chartData, setChartData] = useState<{
    postCounts: number[];
    commentCounts: number[];
  }>({
    postCounts: [0, 0, 0, 0, 0, 0],
    commentCounts: [0, 0, 0, 0, 0, 0],
  });


  useEffect(() => {
    if (status === "loading") return; // Chờ session load xong

    if (!session || session.user?.role !== "admin") {
      router.push("/UI/blog"); // Chuyển hướng nếu không phải admin
    }
  }, [session, status, router]);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [
        statsRes,
        chartRes,
        featuredRes,
        usersRes,
      ] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/chart-stats"),
        fetch("/api/blog/featured"),
        fetch("/api/user"),
      ]);
      const [statsData, chartData, featuredData, userData] = await Promise.all([
        statsRes.json(),
        chartRes.json(),
        featuredRes.json(),
        usersRes.json(),
      ]);
      setStats((prev) =>
        prev.map((stat) => {
          switch (stat.label) {
            case "Total Posts":
              return { ...stat, value: statsData.totalPosts?.toLocaleString() || "0" };
            case "Total Comments":
              return { ...stat, value: statsData.totalComments?.toLocaleString() || "0" };
            case "Users":
              return { ...stat, value: statsData.totalUsers?.toLocaleString() || "0" };
            case "Engagement Rate":
              return {
                ...stat,
                value: `${statsData.interactionRate || 0}%`,
                change: `+${Math.floor(Math.random() * 5)}%`,
                isPositive: true,
              };
            default:
              return stat;
          }
        })
      );
      setChartData({
        postCounts: chartData.postCounts || [0, 0, 0, 0, 0, 0],
        commentCounts: chartData.commentCounts || [0, 0, 0, 0, 0, 0],
      });
      if (featuredData.success && Array.isArray(featuredData.data)) {
        const processed = featuredData.data.map((blog: Blog) => ({
          id: blog._id,
          title: blog.title,
          content: blog.content,
          views: Math.floor(Math.random() * 500) + 100,
          comments: Math.floor(Math.random() * 20) + 5,
        }));
        setPopularPosts(processed);
      }
      setUsers(userData.users || []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    }
  };

  fetchData();
}, []);


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
  const renderBarChart = (data: number[], colorClass: string[]) => {
    const maxValue = Math.max(...data);
    const minHeightPercent = 0;

    return (
      <div className="flex items-end h-48 gap-1 mt-4">
        {data.map((value, idx) => {
          const barHeight = maxValue === 0 
            ? minHeightPercent 
            : Math.max(minHeightPercent, (value / maxValue) * 100);

          return (
            <div key={idx} className="flex h-full flex-col items-center justify-end flex-1">
              <div 
                className={`${colorClass[idx]} rounded-t-sm transition-all duration-300 hover:opacity-80`}
                style={{ height: `${barHeight}%`, width: `20px` }}
              />
              <span className="text-xs text-gray-500 mt-1">Month {idx + 1}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDoughnutChart = (percent: number) => (
    <div className="relative w-40 h-40 mx-auto mt-4">
      <div className="absolute inset-0 rounded-full border-8 border-blue-200"></div>
      <div
        className="absolute inset-0 rounded-full border-8 border-blue-500 border-r-transparent border-b-transparent"
        style={{
          transform: `rotate(${percent * 3.6}deg)`,
          clipPath: "inset(0 0 0 50%)",
        }}
      ></div>
      <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
        <span className="text-xl font-bold">{percent}%</span>
      </div>
    </div>
  );

  const { newUserCount, oldUserCount, percent } = calculateUserStats();


  

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">System Statistics</h1>
        </header>

        <main className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">{stat.label}</p>
                    <h3 className={`text-3xl font-bold ${
                      stat.label.includes('Posts') ? 'text-blue-600' : 
                      stat.label.includes('Comments') ? 'text-green-600' : 
                      stat.label.includes('Users') ? 'text-purple-600' : 'text-orange-600'
                    }`}>
                      {stat.value}
                    </h3>
                    <p className={`text-sm ${stat.isPositive ? 'text-green-500' : 'text-red-500'} mt-1`}>
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
              {renderBarChart(chartData.postCounts, [
                'bg-blue-400', 'bg-blue-500', 'bg-blue-400',
                'bg-blue-500', 'bg-blue-400', 'bg-blue-500'
              ])}
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800">Comment Statistics</h2>
              {renderBarChart(chartData.commentCounts, [
                'bg-green-400', 'bg-green-500', 'bg-green-400',
                'bg-green-500', 'bg-green-400', 'bg-green-500'
              ])}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800">User Distribution</h2>
               {renderDoughnutChart(percent)}
<div className="flex justify-center mt-4 space-x-4 text-sm">
  <div className="flex items-center">
    <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
    <span>New ({newUserCount} account{newUserCount !== 1 ? 's' : ''})</span>
  </div>
  <div className="flex items-center">
    <span className="w-3 h-3 rounded-full bg-blue-200 mr-1"></span>
    <span>Old ({oldUserCount} account{oldUserCount !== 1 ? 's' : ''})</span>
  </div>
</div>
            </div>

            {/* Popular Posts */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Popular Posts</h2>
             <div className="space-y-4">
  {latestPosts.map((post, index) => (
    <div key={post.id} className="flex items-start">
      <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-2.5 py-0.5 rounded-full mr-3">
        #{index + 1}
      </span>
      <div>
        <h3 className="font-medium text-gray-800">{post.title}</h3>
        <p className="text-sm text-gray-500">
          {post.views?.toLocaleString() ?? 0} views • {post.comments ?? 0} comments
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
};