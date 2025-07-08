"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../../components/Footer";
import Navbar from "../../../../components/Navbar";
import { useTranslation } from "react-i18next";
import { Category } from "@/utils/type";
import { FiSearch, FiTrendingUp, FiBookOpen } from "react-icons/fi";

export default function CategoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchProgress();
  }, []);

  const fetchProgress = () => {
    fetch("/api/user-category-progress")
      .then((res) => res.json())
      .then((data) => {
        const map: Record<string, number> = {};
        data.progress.forEach((item: any) => {
          map[item._id] = item.percent;
        });
        setProgress(map);
      });
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/category");
      const data = await res.json();
      setCategories(data.categories || []);
      setFilteredCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      setFilteredCategories(
        categories.filter((category) =>
          category.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredCategories(categories);
    }
  }, [searchQuery, categories]);

  return (
    <>
      <Navbar />
      <div className="max-w-8xl mx-auto pt-20 px-8 sm:px-5 md:px-5 dark:bg-[#121618] dark:text-white min-h-195">
        <div className=" mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Explore Categories
          </h1>
          <div className="max-w-lg mx-auto relative animate-in fade-in-50 duration-700 delay-300">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t("searchCategories", "Search categories...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 bg-white/80 backdrop-blur-sm rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 dark:bg-gray-800/80 dark:border-gray-600 dark:text-white shadow-lg hover:shadow-xl"
            />
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl animate-pulse overflow-hidden h-64 relative"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 relative">
                  <div className="absolute top-4 left-4">
                    <div className="h-8 w-24 bg-white/30 rounded-xl"></div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="h-6 w-12 bg-white/30 rounded-full"></div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="h-4 w-3/4 bg-white/20 rounded-lg mb-2"></div>
                    <div className="h-3 w-1/2 bg-white/20 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCategories.map((category, index) => (
              <div
                key={category._id}
                onClick={() => router.push(`/category/${category.slug}`)}
                className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer group overflow-hidden h-64 animate-in fade-in-50 slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-blue-300 dark:from-blue-900 dark:to-blue-700">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:opacity-100 group-hover:mix-blend-normal opacity-70 mix-blend-overlay"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-200 to-blue-500 dark:from-blue-900 dark:to-blue-700 opacity-80">
                      <span className="text-6xl font-extrabold text-white drop-shadow-lg">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  {/* Overlay chỉ hiện khi chưa hover */}
                
                </div>

                <div className="absolute top-4 left-4 z-10">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-2 rounded-full">
                    <FiBookOpen className="w-4 h-4 text-white" />
                    <span className="text-white font-medium text-sm">
                      {progress[String(category._id)] ?? 0}% complete
                    </span>
                  </div>
                </div>

                <div className="absolute top-4 right-4 z-10">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                    <FiTrendingUp className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300">
                    {category.name}
                  </h3>
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progress[String(category._id)] ?? 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 rounded-3xl transition-all duration-300"></div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredCategories.length === 0 && (
          <div className="text-center py-16 animate-in fade-in-50 duration-500">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiSearch className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No categories found
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Try searching with different keywords
            </p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
