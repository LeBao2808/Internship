"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../components/Footer";
import Navbar from "../../../components/Navbar";
import "./style.css";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
import { getSession } from "next-auth/react";

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
  // const { data: session, status } = useSession();
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
    getSession().then((session) => {
      console.log("Session data:", session);
      if (!session) {
        fetchFeaturedBlog().finally(() => setLoadingFeatures(false));
      } else {
        fetch("/api/recommend")
          .then((res) => res.json())
          .then((data) => setBlogFeatureds(data.recommendations || []))
          .catch(() => setBlogFeatureds([]))
          .finally(() => setLoadingFeatures(false));
        fetchSortedBlogs();
      }
    });
  }, []);

  const fetchSortedBlogs = async () => {
    try {
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: limit.toString(),
        ...(category.length > 0 ? { category: category.join(",") } : {}),
      });
      setLoading(true);
      const res = await fetch(
        `/api/recommend/sort-recomend?${params.toString()}`
      );
      const data = await res.json();
      setBlogs(data.blogs || []);
      setTotal(data.total || 0);
    } catch (error) {
      setBlogs([]);
      setTotal(0);
    }
    setLoading(false);
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

  return (
    <div
      className={`blog-home-bg min-h-screen dark:bg-[#121618] dark:text-white`}
    >
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
          <h2 className="text-2xl font-bold mb-4">{t("featuredPosts")}</h2>
          {loadingFeatures ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden flex flex-col transition min-h-[465px] animate-pulse"
                >
                  <div className="relative w-full h-52 bg-gray-200 flex items-center justify-center">
                    <div className="absolute top-2 left-2 px-2 py-1 bg-blue-100 rounded text-xs font-medium"></div>
                  </div>
                  <div className="flex-1 flex flex-col p-6">
                    <div className="flex items-center gap-2 mb-2 mt-0 pt-0">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded ml-auto"></div>
                    </div>
                    <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-5/6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-2/3 bg-gray-200 rounded mb-6"></div>
                    <div className="h-10 w-28 bg-gray-200 rounded mt-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((blog) => (
                <div
                  key={blog._id}
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden flex flex-col transition hover:-translate-y-1 hover:shadow-2xl cursor-pointer min-h-[465px]"
                  onClick={() => router.push(`/${blog.slug}`)}
                >
                  <div className="relative w-full sm:aspect-[8/5] md:h-52 bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center">
                    <img
                      src={
                        blog.image_url ||
                        "https://res.cloudinary.com/dso3i79wd/image/upload/v1750145670/users/file.png"
                      }
                      alt={blog.title}
                      className="w-full h-52 sm:h-full object-cover"
                    />
                    {blog.category && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium dark:bg-blue-900 dark:text-blue-200 shadow">
                        {blog.category.name}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col p-6">
                    <div className="flex items-center gap-2 mb-2 mt-0 pt-0">
                      {blog.user && (
                        <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <svg
                            className="w-5 h-5 inline-block"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {blog.user.name}
                        </span>
                      )}
                      {blog.createdAt && (
                        <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                          {/* Calendar icon */}
                          <svg
                            className="w-4 h-4 mr-1"
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
                    </div>
                    <h3 className="text-lg font-bold mb-1 hover:text-blue-700 text-gray-800 dark:text-white">
                      {blog.title}
                    </h3>
                    <div
                      className="text-gray-600 dark:text-gray-300 mb-2 line-clamp-3 flex-1 items-center"
                      dangerouslySetInnerHTML={{
                        __html:
                          blog.content && blog.content.length > 100
                            ? blog.content.slice(0, 100) + "..."
                            : blog.content || "",
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/${blog.slug}`);
                      }}
                      className="mt-auto px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-base hover:bg-blue-700 transition shadow cursor-pointer w-max"
                    >
                      {t("readMore", "Read More")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{t("browseByCategory")}</h2>

          <div className="flex flex-wrap gap-3 mb-2">
            <button
              key="all"
              className={`px-4 py-2 border-2 rounded-lg font-medium transition cursor-pointer ${
                category.length === 0
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-blue-600 text-blue-600 hover:bg-blue-50 bg-white"
              }`}
              onClick={() => {
                setCategory([]);
                setPage(1);
              }}
            >
              {t("allCategory")}
            </button>
            {categories.map((cat) => {
              const isSelected = category.includes(cat._id);
              return (
                <button
                  key={cat._id}
                  className={`px-4 py-2 border-2 rounded-lg font-medium transition cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-blue-600 text-blue-600 hover:bg-blue-50 bg-white"
                  }`}
                  onClick={() => {
                    setCategory((prev) =>
                      isSelected
                        ? prev.filter((id) => id !== cat._id)
                        : [...prev, cat._id]
                    );
                    setPage(1);
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Latest Posts */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4">
            {t("latestPosts", "Bài viết mới nhất")}
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden flex flex-col transition cursor-pointer"
                >
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 ml-auto"></div>
                    </div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mt-auto self-start"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestPosts.map((blog) => (
                <div
                  key={blog._id}
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden flex flex-col transition hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
                  onClick={() => router.push(`/${blog.slug}`)}
                >
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {blog.category && (
                        <span className="text-xs text-blue-600 font-semibold">
                          {blog.category.name}
                        </span>
                      )}
                      {blog.createdAt && (
                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-base hover:text-blue-700">
                      {blog.title}
                    </h3>
                    <div
                      className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html:
                          blog.content && blog.content.length > 60
                            ? blog.content.slice(0, 60) + "..."
                            : blog.content || "",
                      }}
                    />
                    <button
                      onClick={() => router.push(`/${blog.slug}`)}
                      className="text-blue-600 hover:underline text-sm font-medium mt-auto self-start"
                    >
                      {t("readMore", "Đọc tiếp")} →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search & All Posts */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div className="flex px-6 py-3 rounded-xl border-2 border-blue-400 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-300 transition-all duration-200 items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="22"
              height="22"
              className="text-blue-500 mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              placeholder={t("searchPlaceholder")}
              value={searchValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full outline-none bg-transparent text-gray-700 text-base font-semibold font-sans placeholder:font-normal placeholder:text-gray-400"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            />
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="group bg-white dark:bg-gray-900 rounded-xl shadow-none hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:h-48">
                  <div className="relative w-full sm:w-2/5 h-48 sm:h-full bg-gray-200 animate-pulse flex-shrink-0 rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none">
                    <div className="absolute top-2 left-2 px-2 py-1 bg-blue-100 rounded text-xs font-medium"></div>
                  </div>
                  <div className="flex-1 flex flex-col p-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="flex items-center text-xs text-gray-400 mb-2 gap-3">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                        <div className="h-3 bg-gray-300 rounded w-16"></div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                        <div className="h-3 bg-gray-300 rounded w-12"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6 mb-2 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/4 mt-auto animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center text-gray-500 py-12 text-lg">
            No blog found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                onClick={() => router.push(`/${blog.slug}`)}
                className="cursor-pointer group bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:h-48">
                  <div className="relative w-full sm:w-2/5 h-48 sm:h-full bg-gray-100 overflow-hidden flex-shrink-0">
                    <img
                      src={
                        blog.image_url ||
                        "https://res.cloudinary.com/dso3i79wd/image/upload/v1750145670/users/file.png"
                      }
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {blog.category && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium dark:bg-blue-900 dark:text-blue-200 shadow">
                        {blog.category.name}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col p-4">
                    <h2 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-700 transition line-clamp-2 dark:text-white">
                      {blog.title}
                    </h2>
                    <div className="flex items-center text-xs text-gray-400 mb-2 gap-3">
                      {blog.createdAt && (
                        <span className="flex items-center gap-1">
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                      )}
                      {blog.user && (
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
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
                      className="text-gray-600 text-sm mb-3 line-clamp-3 dark:text-gray-300 flex-1"
                      dangerouslySetInnerHTML={{
                        __html:
                          blog.content && blog.content.length > 100
                            ? blog.content.slice(0, 100) + "..."
                            : blog.content || "",
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/${blog.slug}`);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium self-start mt-auto"
                    >
                      {t("readMore", "Đọc tiếp")} →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-center items-center gap-4 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded-lg font-medium disabled:opacity-50 hover:bg-gray-300 transition cursor-pointer dark:text-white dark:bg-gray-500"
          >
            Previous
          </button>
          <span className="text-gray-700 font-semibold cursor-pointer">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="px-4 py-2 bg-gray-200 rounded-lg font-medium disabled:opacity-50 hover:bg-gray-300 transition cursor-pointer dark:text-white dark:bg-gray-500"
          >
            Next
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
