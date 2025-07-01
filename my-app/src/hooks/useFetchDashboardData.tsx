import { useState } from "react";

interface UserViewStats {
  totalViewed: number;
  topCategory: string;
}

export const useFetchDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{ postCounts: number[]; commentCounts: number[] }>({
    postCounts: [],
    commentCounts: [],
  });
  const [popularPosts, setPopularPosts] = useState<any[]>([]);
  const [userViewStats, setUserViewStats] = useState<UserViewStats>({
    totalViewed: 0,
    topCategory: "N/A",
  });

  const fetchData = async (role?: string, userId?: string) => {
    setLoading(true);
    try {
      let statsData, chartData, featuredData, histories = [];
      let topCategory = "N/A";

      if (role === "admin") {
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

        if (featuredData.data) {
          setPopularPosts(featuredData.data);
        }
      } else {
        // Nếu là user thì truyền userId vào
        const userQuery = userId ? `?user=${userId}` : "";
        const [userStatsRes, userChartRes, viewHistoryRes] = await Promise.all([
          fetch(`/api/stats${userQuery}`),
          fetch(`/api/chart-stats${userQuery}`),
          fetch(`/api/view-history${userQuery}`),
        ]);
        [statsData, chartData, histories] = await Promise.all([
          userStatsRes.json(),
          userChartRes.json(),
          viewHistoryRes.json(),
        ]);
      }

      // Xử lý category xem nhiều nhất
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
        totalViewed: histories.length,
        topCategory: topCategory || "N/A",
      });

      // Cập nhật stats
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
                value: String(histories.length),
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

      // Cập nhật biểu đồ
      setChartData({
        postCounts: chartData.postCounts || Array(12).fill(0),
        commentCounts: chartData.commentCounts || Array(12).fill(0),
      });

      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Lỗi tải dữ liệu");
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    stats,
    chartData,
    popularPosts,
    userViewStats,
    fetchData,
  };
};