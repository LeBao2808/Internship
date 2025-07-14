"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import {
  FiUser,
  FiCalendar,
  FiArrowRight,
  FiBookmark,
  FiTrash2,
} from "react-icons/fi";
import { SaveBlog } from "@/utils/type";

export default function SavedBlogsPage() {
  const [savedBlogs, setSavedBlogs] = useState<SaveBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    fetchSavedBlogs();
  }, []);

  const fetchSavedBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/saveblog");
      const data = await res.json();
      setSavedBlogs(data.savedBlogs || []);
    } catch (error) {
      console.error("Error fetching saved blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveBlog = async (blogId: string) => {
    try {
      await fetch("/api/saveblog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId }),
      });
      setSavedBlogs((prev) => prev.filter((item) => item.blog._id !== blogId));
    } catch (error) {
      console.error("Error unsaving blog:", error);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 dark:bg-[#121618] dark:text-white min-h-screen">
        <Navbar />
        <div className="mt-10">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FiBookmark className="w-12 h-12 text-red-500" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                Saved Blogs
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Your collection of saved articles
            </p>
          </div>

          {loading ? (
            <div className="text-center py-16 animate-in fade-in-50 duration-500">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiTrash2 className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No articles found
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                Try searching with different keywords or explore other
                categories
              </p>
            </div>
          ) : savedBlogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiBookmark className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No saved blogs yet
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">
                Start saving articles you want to read later
              </p>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300"
              >
                Explore Blogs
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {savedBlogs.map((item: any) => (
                <div
                  key={item._id}
                  className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl min-h-[500px] group"
                >
                  <div className="relative w-full h-56 overflow-hidden">
                    <img
                      src={
                        item.blog.image_url ||
                        "https://res.cloudinary.com/dso3i79wd/image/upload/v1750145670/users/file.png"
                      }
                      alt={item.blog.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/40 transition-all duration-300"></div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnsaveBlog(item.blog._id);
                      }}
                      className="absolute top-4 right-4 p-3 rounded-full bg-red-500/90 backdrop-blur-md text-white border border-red-400 transition-all duration-300 hover:bg-red-600 hover:scale-110 shadow-lg cursor-pointer"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>

                    {item.blog.category && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-700 rounded-full text-xs font-semibold shadow-lg">
                        {item.blog.category.name}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col p-6">
                    <div className="flex items-center justify-between mb-4">
                      {item.blog.user && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <FiUser className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium">
                            {item.blog.user.name}
                          </span>
                        </div>
                      )}
                      {item.createdAt && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <FiCalendar className="w-4 h-4" />
                          <span>
                            Saved{" "}
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white group-hover:text-red-500 transition-colors duration-300 line-clamp-2">
                      {item.blog.title}
                    </h3>

                    <div
                      className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 flex-1 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html:
                          item.blog.content && item.blog.content.length > 120
                            ? item.blog.content.slice(0, 120) + "..."
                            : item.blog.content || "",
                      }}
                    />

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => router.push(`/${item.blog.slug}`)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                      >
                        <span>Read Now</span>
                        <FiArrowRight className="w-4 h-4" />
                      </button>
                      <div className="text-xs text-gray-400 font-medium">
                        {Math.ceil((item.blog.content?.length || 0) / 200)} min
                        read
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
