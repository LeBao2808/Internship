"use client";

import React, { use, useEffect, useState } from "react";
import { Blog, Category } from "@/utils/type";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();
  const { slug: rawSlug } = use(params);
  const router = useRouter();
  const slug = decodeURIComponent(rawSlug);
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
      setBlogs(Array.isArray(data.blogs) ? data.blogs : []);
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
         <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          {slug}
        </h1>
        <div className="text-center mb-8">
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder={t("searchBlogs", "Search blogs...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-blue-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-lg animate-pulse dark:bg-gray-900 dark:border-gray-800 flex flex-col min-h-[465px]"
            >
              <div className="h-52 w-full bg-gray-200 rounded-lg mb-6"></div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-16 bg-gray-200 rounded ml-auto"></div>
              </div>
              <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded mb-6"></div>
              <div className="h-10 w-28 bg-gray-200 rounded mt-auto"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden flex flex-col transition hover:-translate-y-1 hover:shadow-2xl cursor-pointer min-h-[465px]"
                   onClick={() => router.push(`/${blog.slug}`)}
            >
              <div className="relative w-full h-52 bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center">
                <img
                  src={
                    blog.image_url ||
                    "https://res.cloudinary.com/dso3i79wd/image/upload/v1750145670/users/file.png"
                  }
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
                {blog.category && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium dark:bg-blue-900 dark:text-blue-200 shadow">
                    {blog.category.name}
                  </span>
                )}
              </div>
              <div className="flex-1 flex flex-col p-6">
                <div className="flex items-center gap-2 mb-2">
                  {blog.user && (
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <svg
                        className="w-5 h-5"
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
                </div>
                <h3 className="text-lg font-bold mb-1 hover:text-blue-700 text-gray-800 dark:text-white">
                  {blog.title}
                </h3>
                <div
                  className="text-gray-600 dark:text-gray-300 mb-2 line-clamp-3 flex-1"
                  dangerouslySetInnerHTML={{
                    __html:
                      blog.content && blog.content.length > 100
                        ? blog.content.slice(0, 100) + "..."
                        : blog.content || "",
                  }}
                />
                <button className="mt-auto px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-base hover:bg-blue-700 transition shadow w-max">
                  {t("readMore", "Read More")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
          <Footer/>
          </>
  );
}
