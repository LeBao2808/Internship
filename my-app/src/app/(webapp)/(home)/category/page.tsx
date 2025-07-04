"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../../components/Footer";
import Navbar from "../../../../components/Navbar";
import { useTranslation } from "react-i18next";
import { Category } from "@/utils/type";

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
      <div className="max-w-7xl mx-auto pt-20 px-8 sm:px-5 md:px-5 dark:bg-[#121618] dark:text-white`">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Categories
        </h1>
        <div className="text-center mb-8">
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder={t("searchCategories", "Search categories...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-blue-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-xl h-48 animate-pulse"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <div
                key={category._id}
                onClick={() => router.push(`/category/${category.slug}`)}
                className="relative bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-2xs transition-all duration-300 cursor-pointer group overflow-hidden h-48"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-blue-300 dark:from-blue-900 dark:to-blue-700">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-all duration-300 opacity-70 group-hover:opacity-100 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-6xl font-bold text-blue-600 dark:text-blue-300">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="absolute top-3 left-3 z-10">
                  <h3 className="text-lg font-bold text-white bg-black/40 px-3 py-1 rounded-lg shadow">
                    {category.name}
                  </h3>
                </div>
                <div className="absolute top-3 right-3 z-10">
                  <span className="text-xs font-semibold bg-white/80 text-blue-700 px-2 py-1 rounded-lg shadow">
                    {progress[String(category._id)] ?? 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
