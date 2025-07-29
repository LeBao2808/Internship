"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../components/Footer";
import Navbar from "../../../components/Navbar";
import "./style.css";
import { useTranslation } from "react-i18next";
import { getSession } from "next-auth/react";
import { FiBookmark, FiEye } from "react-icons/fi";
import CategoryModal from "../../../components/CategoryModal";

interface Blog {
  _id: string;
  title: string;
  content: string;
  image_url?: string;
  user?: { _id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
  category?: Category;
  featured?: boolean;
  slug?: string;
}
interface Category {
  _id: string;
  name: string;
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogFeatureds, setBlogFeatureds] = useState<Blog[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingFeatures, setLoadingFeatures] = useState(true);
  const [category, setCategory] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const { t } = useTranslation("common");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [savedBlogs, setSavedBlogs] = useState<string[]>([]);
  const [viewedBlogs, setViewedBlogs] = useState<string[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [page]);

  useEffect(() => {
    const fetchData = async () => {
      setPage(1);
      await fetchBlogs();
    };
    fetchData();
  }, [search, category]);

  useEffect(() => {
    setLoadingFeatures(true);
    getSession().then(async (session) => {
      console.log("Session data:", session);
      if (!session) {
        fetchFeaturedBlog().finally(() => setLoadingFeatures(false));
      } else {
        // Check if user has recommendation
        const recResponse = await fetch("/api/recommendation-category");
        const recData = await recResponse.json();
        
        if (recData.recommendation) {
          fetch("/api/recommend")
            .then((res) => res.json())
            .then((data) => setBlogFeatureds(data.recommendations || []))
            .catch(() => setBlogFeatureds([]))
            .finally(() => setLoadingFeatures(false));
        } else {
          setShowCategoryModal(true);
          // Keep loadingFeatures true until category selection is done
        }
      }

      // Fetch saved blogs and viewed status
      fetchSavedAndViewedBlogs();
    });
  }, []);

  const fetchSavedAndViewedBlogs = async () => {
    try {
      const saveRes = await fetch("/api/saveblog");
      const saveData = await saveRes.json();
      setSavedBlogs(saveData.savedBlogs?.map((s: any) => s.blog._id) || []);
    } catch (error) {
      setSavedBlogs([]);
    }
  };

  const handleSaveBlog = async (blogId: string) => {
    console.log("Toggling save for blog:", blogId);
    try {
      if (savedBlogs.includes(blogId)) {
        await fetch("/api/saveblog", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blogId }),
        });
        setSavedBlogs((prev) => prev.filter((id) => id !== blogId));
      } else {
        await fetch("/api/saveblog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blogId }),
        });
        setSavedBlogs((prev) => [...prev, blogId]);
      }
    } catch (error) {
      console.error("Error saving blog:", error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const featuredPosts = useMemo(
    () => blogFeatureds.slice(0, 3),
    [blogFeatureds]
  );
  const latestPosts = useMemo(() => blogs.slice(0, 4), [blogs]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/category");
      const data = await res.json();
      const { categories } = data;
      setCategories(categories);
    } catch {
      setCategories([]);
    }
  };

  const fetchFeaturedBlog = async () => {
    try {
      const res = await fetch("/api/blog/featured");

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      console.log("Raw data from API:", data);

      if (data.success) {
        setLoadingFeatures(true);
        const featuredList = data.data || [];
        setBlogFeatureds(featuredList);
        setLatestBlogs(featuredList);
      } else {
        console.error("API returned error:", data.message);
      }
      setLoadingFeatures(false);
    } catch (error) {
      console.error("Failed to fetch featured blogs:", error);
    }
  };

  const fetchBlogs = async () => {
    try {
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: limit.toString(),
        ...(category.length > 0 ? { category: category.join(",") } : {}),
      });
      setLoading(true);
      const res = await fetch(`/api/bloghome?${params.toString()}`);
      const data = await res.json();
      setBlogs(data.blogs || []);
      setTotal(data.total || 0);
    } catch (error) {
      setBlogs([]);
      setTotal(0);
    }
    setLoading(false);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchChange(searchValue);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const handleCategoryModalComplete = () => {
    setShowCategoryModal(false);
    // Fetch recommendations after category selection
    fetch("/api/recommend")
      .then((res) => res.json())
      .then((data) => setBlogFeatureds(data.recommendations || []))
      .catch(() => setBlogFeatureds([]))
      .finally(() => setLoadingFeatures(false));
  };

  return (
    <div
      className={`blog-home-bg min-h-screen dark:bg-[#121618] dark:text-white`}
    >
      {showCategoryModal && <CategoryModal onComplete={handleCategoryModalComplete} />}
      <Navbar />
      <div className="max-w-7xl mx-auto pt-20 px-8 sm:px-5 md:px-5">
        <div className="w-full mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-[#86cfff] to-blue-600  dark:bg-gradient-to-r dark:from-[#01072c] dark:to-[#010a6b] rounded-xl p-8 md:p-12 shadow-lg">
            <div className="flex-1 text-left md:pr-10">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg leading-tight">
                {t("learnToCode")}
                <br />
                {t("oneDayAtATime")}
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl">
                {t("aBlogForBeginners")}
              </p>
            </div>
            <div className="flex-1 flex justify-center mt-8 md:mt-0">
              <img
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                alt="Banner"
                className="rounded-xl shadow-lg max-w-full md:max-w-[420px] h-auto object-cover"
                style={{ minWidth: 280 }}
              />
            </div>
          </div>
        </div>

        {/* Featured Posts */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 bg-clip-text text-transparent dark:from-cyan-200 dark:via-cyan-100  dark:to-cyan-50">
              {t("recommendPosts", "Recommended Posts")}
            </h2>
          </div>
          {loadingFeatures ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[500px] animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="h-56 w-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 relative">
                    <div className="absolute top-4 left-4 w-16 h-6 bg-white/30 rounded-full"></div>
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      </div>
                      <div className="h-3 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                    <div className="h-6 w-4/5 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
                    <div className="space-y-2 mb-6">
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="h-12 w-32 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
                      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((blog, index) => (
                <div
                  key={blog._id}
                  className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl  min-h-[500px] group animate-in fade-in-50 slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                  // onClick={() => router.push(`/${blog.slug}`)}
                >
                  <div className="relative w-full h-56 overflow-hidden">
                    <img
                      src={
                        blog.image_url ||
                        "https://res.cloudinary.com/dso3i79wd/image/upload/v1750145670/users/file.png"
                      }
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/40 transition-all duration-300"></div>
                    {blog.category && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-700 rounded-full text-xs font-semibold shadow-lg">
                        {blog.category.name}
                      </span>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveBlog(blog._id);
                        }}
                        className={`p-3 rounded-full backdrop-blur-md border transition-all duration-500 transform hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl cursor-pointer ${
                          savedBlogs.includes(blog._id)
                            ? "bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-400 shadow-red-500/25"
                            : "bg-white/90 text-gray-700 border-white/50 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white hover:border-red-400"
                        }`}
                      >
                        <FiBookmark
                          className={`w-5 h-5 transition-all duration-300 ${
                            savedBlogs.includes(blog._id) ? "fill-current" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {viewedBlogs.includes(blog._id) && (
                      <div className="absolute bottom-4 right-4 flex items-center gap-1 px-2 py-1 bg-green-500/90 backdrop-blur-sm text-white rounded-full text-xs font-semibold shadow-lg">
                        <FiEye className="w-3 h-3" />
                        <span>Viewed</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col p-6">
                    <div className="flex items-center justify-between mb-4">
                      {blog.user && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <span className="font-medium">{blog.user.name}</span>
                        </div>
                      )}
                      {blog.createdAt && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                      {blog.title}
                    </h3>

                    <div
                      className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 flex-1 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html:
                          blog.content && blog.content.length > 120
                            ? blog.content.slice(0, 120) + "..."
                            : blog.content || "",
                      }}
                    />

                    <div className="flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/${blog.slug}`);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105 cursor-pointer"
                      >
                        <span>{t("readMore", "Read More")}</span>
                        <svg
                          className="w-4 h-4 transition-transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                      <div className="text-xs text-gray-400 font-medium">
                        {Math.ceil((blog.content?.length || 0) / 200)} min read
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-cyan-500 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 bg-clip-text text-transparent dark:from-cyan-200 dark:via-cyan-100  dark:to-cyan-50">
              {t("browseByCategory")}
            </h2>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              key="all"
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer ${
                category.length === 0
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-blue-500/25"
                  : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => {
                setCategory([]);
                setPage(1);
              }}
            >
              <div className="flex items-center gap-2 cursor-pointer">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                <span>{t("allCategory")}</span>
              </div>
            </button>
            {categories.map((cat, index) => {
              const isSelected = category.includes(cat._id);
              return (
                <button
                  key={cat._id}
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl animate-in fade-in-50 slide-in-from-bottom-2 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-blue-500/25"
                      : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => {
                    setCategory((prev) =>
                      isSelected
                        ? prev.filter((id) => id !== cat._id)
                        : [...prev, cat._id]
                    );
                    setPage(1);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isSelected
                          ? "bg-white/80"
                          : "bg-gradient-to-r from-blue-400 to-purple-400"
                      }`}
                    ></div>
                    <span>{cat.name}</span>
                    {isSelected && (
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Latest Posts */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 bg-clip-text text-transparent dark:from-cyan-200 dark:via-cyan-100  dark:to-cyan-50">
              {t("latestPosts", "Latest Posts")}
            </h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden flex flex-col animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full w-16"></div>
                      <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-12 ml-auto"></div>
                    </div>
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-4/5 mb-3"></div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                    <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-xl w-24 mt-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestPosts.map((blog, index) => (
                <div
                  key={blog._id}
                  className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer group animate-in fade-in-50 slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => router.push(`/${blog.slug}`)}
                >
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      {blog.category && (
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 dark:from-blue-900 dark:to-purple-900 dark:text-blue-300 rounded-full text-xs font-semibold">
                          {blog.category.name}
                        </span>
                      )}
                      {blog.createdAt && (
                        <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                      {blog.title}
                    </h3>
                    <div
                      className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-1 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html:
                          blog.content && blog.content.length > 80
                            ? blog.content.slice(0, 80) + "..."
                            : blog.content || "",
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/${blog.slug}`);
                      }}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-semibold mt-auto self-start group-hover:gap-3 transition-all duration-300"
                    >
                      <span>{t("readMore", "Read More")}</span>
                      <svg
                        className="w-4 h-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search & All Posts */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 bg-clip-text text-transparent dark:from-cyan-200 dark:via-cyan-100  dark:to-cyan-50">
              All Articles
            </h2>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                placeholder={t(
                  "searchPlaceholder",
                  "Search articles, topics, authors..."
                )}
                value={searchValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full pl-16 pr-6 py-4 border-2 border-gray-200 bg-white/90 backdrop-blur-sm rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 dark:bg-gray-800/90 dark:border-gray-600 dark:text-white shadow-lg hover:shadow-xl text-lg"
              />
            </div>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:h-56">
                  <div className="relative w-full sm:w-2/5 h-48 sm:h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex-shrink-0">
                    <div className="absolute top-4 left-4 w-16 h-6 bg-white/30 rounded-full"></div>
                  </div>
                  <div className="flex-1 flex flex-col p-6">
                    <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-4/5 mb-3"></div>
                    <div className="flex items-center mb-3 gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4 flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                    </div>
                    <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-xl w-28"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 animate-in fade-in-50 duration-500">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-3">
              No articles found
            </h3>
            <p className="text-gray-500 dark:text-gray-500 text-lg">
              Try adjusting your search terms or explore different categories
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {blogs.map((blog, index) => (
              <div
                key={blog._id}
                // onClick={() => router.push(`/${blog.slug}`)}
                className=" group bg-white dark:bg-gray-900 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-1 animate-in fade-in-50 slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:h-56">
                  <div className="relative w-full sm:w-2/5 h-48 sm:h-full overflow-hidden flex-shrink-0">
                    <img
                      src={
                        blog.image_url ||
                        "https://res.cloudinary.com/dso3i79wd/image/upload/v1750145670/users/file.png"
                      }
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/40 transition-all duration-300"></div>
                    {blog.category && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-700 rounded-full text-xs font-semibold shadow-lg">
                        {blog.category.name}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveBlog(blog._id);
                      }}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition-all duration-500 transform hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl cursor-pointer ${
                        savedBlogs.includes(blog._id)
                          ? "bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-400 shadow-red-500/25"
                          : "bg-white/90 text-gray-700 border-white/50 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white hover:border-red-400"
                      }`}
                    >
                      <FiBookmark
                        className={`w-5 h-5 transition-all duration-300 ${
                          savedBlogs.includes(blog._id) ? "fill-current" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col p-6">
                    <h2 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2 dark:text-white">
                      {blog.title}
                    </h2>
                    <div className="flex items-center text-sm text-gray-500 mb-3 gap-4">
                      {blog.createdAt && (
                        <span className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                      )}
                      {blog.user && (
                        <span className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {typeof blog.user === "object"
                            ? blog.user.name
                            : blog.user}
                        </span>
                      )}
                    </div>
                    <div
                      className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-1 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html:
                          blog.content && blog.content.length > 120
                            ? blog.content.slice(0, 120) + "..."
                            : blog.content || "",
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/${blog.slug}`);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105 cursor-pointer"
                      >
                        <span>{t("readMore", "Read More")}</span>
                        <svg
                          className="w-4 h-4 transition-transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                      <div className="text-xs text-gray-400 font-medium">
                        {Math.ceil((blog.content?.length || 0) / 200)} min read
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-center items-center gap-6 mt-16">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </button>
          <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg">
            <span>{page}</span>
            <span className="text-blue-200">of</span>
            <span>{totalPages}</span>
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            Next
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
      <Footer />

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-7 z-50 bg-blue-600 text-white p-3 rounded-full shadow-2xl hover:bg-blue-700 hover:scale-110 transition-all duration-200 flex items-center justify-center cursor-pointer"
          aria-label="Scroll to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
