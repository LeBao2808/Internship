"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../components/Footer";
import UserButton from "../../../components/UserButton";
import "./style.css";
import { useTranslation } from "react-i18next";
// import { Blog } from "@/utils/type"

interface Blog {
  _id: string;
  title: string;
  content: string;
  image_url?: string;
  user?: string | { _id: string; name: string };
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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const { t } = useTranslation("common");
  useEffect(() => {
    fetchCategories();
    fecthFeaturedBlog();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setPage(1);
      await fetchBlogs();
    };
    fetchData();
  }, [search, category]);

  useEffect(() => {
    fetchBlogs();
  }, [page]);

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

  const fecthFeaturedBlog = async () => {
    try {
      const res = await fetch("/api/blog/featured");

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      console.log("Raw data from API:", data);

      if (data.success) {
        const featuredList = data.data || [];
        setBlogFeatureds(featuredList);
      } else {
        console.error("API returned error:", data.message);
      }
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
        ...(category ? { category } : {}),
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
      className={`blog-home-bg min-h-screen px-5 sm:px-2 md:px-0 dark:bg-[#121618] dark:text-white`}
    >
      <div className="flex justify-end ">
        <div className="flex items-center rounded-lg mr-2 mt-2 p-1 absolute right-0 top-0">
          <UserButton />
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16">
        <div className="flex w-full justify-end"></div>
        <div className="text-center mb-12">
          <h1 className="title font-extrabold mb-4 text-gray-900 drop-shadow-lg leading-tight">
            {t("learnToCode")}
            <br />
            {t("oneDayAtATime")}
          </h1>
          <p className="sub_title text-gray-600 mb-8 max-w-2xl mx-auto">
            {t("aBlogForBeginners")}
          </p>
        </div>

        {/* Featured Posts */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">{t("featuredPosts")}</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl shadow-lg animate-pulse dark:bg-gray-900 dark:border-gray-800"
                >
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((blog) => (
                <div
                  key={blog._id}
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden flex flex-col transition hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
                  onClick={() => router.push(`/${blog.slug}`)}
                >
                  <div className="h-48 w-full bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center">
                    <img
                      src={
                        blog.image_url ||
                        "https://res.cloudinary.com/dso3i79wd/image/upload/v1750145670/users/file.png"
                      }
                      alt={blog.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col p-6">
                    <div className="flex items-center gap-2 mb-2">
                      {blog.category && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium dark:bg-blue-900 dark:text-blue-200">
                          {blog.category.name}
                        </span>
                      )}
                      {blog.createdAt && (
                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">
                      {blog.title}
                    </h3>
                    <div
                      className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3"
                      dangerouslySetInnerHTML={{
                        __html:
                          blog.content && blog.content.length > 90
                            ? blog.content.slice(0, 90) + "..."
                            : blog.content || "",
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/${blog.slug}`);
                      }}
                      className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-base hover:bg-blue-700 transition shadow cursor-pointer w-max"
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
          <h2 className="text-2xl font-bold mb-4">{t("browseByCategory")}</h2>
          <div className="flex flex-wrap gap-3 mb-2">
            <button
              key="all"
              className={`px-4 py-2 border-2 rounded-lg font-medium transition cursor-pointer ${
                !category
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-blue-600 text-blue-600 hover:bg-blue-50 bg-white"
              }`}
              onClick={() => {
                setCategory(null);
                setPage(1);
              }}
            >
              {t("allCategory")}
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                className={`px-4 py-2 border-2 bg-blue-100 text-blue-700 rounded-lg font-medium transition cursor-pointer ${
                  category === cat._id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-blue-600 text-blue-600 hover:bg-blue-50 bg-white"
                }`}
                onClick={() => {
                  setCategory(cat._id);
                  setPage(1);
                }}
              >
                {cat.name}
              </button>
            ))}
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
                  className="bg-white p-6 rounded-2xl shadow-lg animate-pulse dark:bg-gray-900 dark:border-gray-800"
                >
                  <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/3"></div>
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
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-base">
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
          <div className="flex px-6 py-3 rounded-md border-2 border-blue-500 overflow-hidden bg-white ">
            <input
              // type="email"
              placeholder="Search Something..."
              value={searchValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full outline-none bg-transparent text-gray-600 text-sm"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 192.904 192.904"
              width="16px"
              className="fill-gray-600"
            >
              <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"></path>
            </svg>
          </div>
        </div>
        {loading ? (
          <div>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg shadow-md animate-pulse dark:bg-gray-900 dark:border-gray-800"
              >
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center text-gray-500 py-12 text-lg">
            No blog found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div
                onClick={() => router.push(`/${blog.slug}`)}
                key={blog._id}
                className="group bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col transition transform hover:-translate-y-1 hover:shadow-2xl cursor-pointer dark:bg-gray-900 dark:border-gray-800 dark:hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.15)]"
              >
                <div className="h-auto w-full bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center">
                  <img
                    src={
                      blog.image_url ||
                      "https://res.cloudinary.com/dso3i79wd/image/upload/v1750145670/users/file.png"
                    }
                    alt={blog.title}
                    className="h-auto aspect-[8/5] w-full object-cover"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="flex-1 flex flex-col p-6">
                  <h2 className="text-2xl font-bold mb-2 text-gray-800 group-hover:text-blue-700 transition dark:text-white">
                    {blog.title}
                  </h2>
                  {blog.user && (
                    <p className="text-sm text-gray-500 mb-1">
                      <b>Author:</b>{" "}
                      {typeof blog.user === "object" &&
                      blog.user !== null &&
                      "name" in blog.user
                        ? blog.user.name
                        : ""}
                    </p>
                  )}
                  {blog.createdAt && (
                    <p className="text-xs text-gray-400 mb-2">
                      Posted at: {new Date(blog.createdAt).toLocaleString()}
                    </p>
                  )}
                  <div
                    className="text-gray-600 mb-4 line-clamp-3"
                    dangerouslySetInnerHTML={{
                      __html:
                        blog.content && blog.content.length > 120
                          ? blog.content.slice(0, 120) + "..."
                          : blog.content || "",
                    }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/${blog.slug}`);
                    }}
                    className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-base hover:bg-blue-700 transition shadow cursor-pointer w-max"
                  >
                    {t("readMore", "Read More")}
                  </button>
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
    </div>
  );
}
