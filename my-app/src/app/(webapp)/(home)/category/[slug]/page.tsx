"use client";

import React, { use, useEffect, useState } from "react";
import { Blog, Category } from "@/utils/type";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { useSession } from "next-auth/react";
import {
  FiSearch,
  FiUser,
  FiCalendar,
  FiArrowRight,
  FiBookOpen,
  FiEye,
  FiBookmark,
} from "react-icons/fi";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewedBlogs, setViewedBlogs] = useState<string[]>([]);
  const [savedBlogs, setSavedBlogs] = useState<string[]>([]);
  const { t } = useTranslation();
  const { slug: rawSlug } = use(params);
  const router = useRouter();
  const slug = decodeURIComponent(rawSlug);
  const { data: session } = useSession();

  const handleSaveBlog = async (blogId: string) => {
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
    fetchCategory();
  }, [slug, searchQuery]);
  const fetchCategory = async () => {
    try {
      setLoading(true);
      let url = "/api/bloghome";
      const params = [];
      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
      if (slug) params.push(`categorySlug=${encodeURIComponent(slug)}`);
      if (params.length > 0) url += "?" + params.join("&");
      const res = await fetch(url);
      const data = await res.json();
      const blogList = Array.isArray(data.blogs) ? data.blogs : [];
      setBlogs(blogList);

      // Fetch view status and saved blogs
      if (blogList.length > 0) {
        const blogIds = blogList.map((b: any) => b._id).filter(Boolean);
        const viewRes = await fetch("/api/view-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blogIds }),
        });
        const viewData = await viewRes.json();
        setViewedBlogs(viewData.viewed || []);

        // Fetch saved blogs
        const saveRes = await fetch("/api/saveblog");
        const saveData = await saveRes.json();
        setSavedBlogs(
          saveData.savedBlogs
            ?.filter((s: any) => s?.blog && s.blog._id)
            .map((s: any) => s.blog._id) || []
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!blogs) return <div className="text-center">{t("categoryNotFound")}</div>;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 dark:bg-[#121618] dark:text-white min-h-195">
        <Navbar />
        <div className="mt-10">
          <div className="text-center mb-12">
            <div className="flex gap-3 mb-4">
              <h1 className="text-5xl font-bold capitalize bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 bg-clip-text text-transparent animate-in fade-in-50 duration-700">
                {slug}
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 animate-in fade-in-50 duration-700 delay-200">
              Explore articles in {slug} category
            </p>
            <div className="max-w-lg mx-auto relative animate-in fade-in-50 duration-700 delay-300">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t("searchBlogs", "Search articles...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 bg-white/80 backdrop-blur-sm rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 dark:bg-gray-800/80 dark:border-gray-600 dark:text-white shadow-lg hover:shadow-xl"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl animate-pulse flex flex-col min-h-[500px] overflow-hidden"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="h-56 w-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"></div>
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
          ) : blogs.length === 0 ? (
            <div className="text-center py-16 animate-in fade-in-50 duration-500">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiSearch className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No articles found
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                Try searching with different keywords or explore other
                categories
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog: any, index: number) => (
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
                        "https://res.cloudinary.com/dso3i79wd/image/upload/v1750145670/users/file.png "
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

                    {session ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveBlog(blog._id);
                        }}
                        className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md border transition-all duration-500 transform hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl cursor-pointer ${
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
                    ) : null}

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
                            <FiUser className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium">{blog.user.name}</span>
                        </div>
                      )}
                      {blog.createdAt && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <FiCalendar className="w-4 h-4" />
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
                        onClick={() => router.push(`/${blog.slug}`)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105 cursor-pointer"
                      >
                        <span>{t("readMore", "Read More")}</span>
                        <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
      </div>
      <Footer />
    </>
  );
}
