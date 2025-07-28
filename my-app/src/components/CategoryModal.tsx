"use client";
import { Category } from "@/utils/type";
import "./css/CategoryModal.css";
import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

export default function CategoryModal() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [hasRecommendation, setHasRecommendation] = useState(false);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleConfirm = async () => {
    if (!session?.user?.id || selectedCategories.length === 0) return;

    try {
      const response = await fetch("/api/recommendation-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id as string,
          categories: selectedCategories,
        }),
      });

      if (response.ok) {
        document.getElementById("categoryModal")?.remove();
      }
    } catch (error) {
      console.error("Error saving categories:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;

      // Check if user already has recommendation
      const recResponse = await fetch(
        `/api/recommendation-category`
      );
      const recData = await recResponse.json();

      if (recData.recommendation) {
        setHasRecommendation(true);
        return;
      }

      const catResponse = await fetch("/api/category");
      const catData = await catResponse.json();
      setCategories(catData.categories);
    };

    fetchData();
  }, [session]);

  if (!session || hasRecommendation) {
    return null;
  }
  return (
    <div
      id="categoryModal"
      className="modal fixed inset-0 z-50 flex items-center justify-center fade-in"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl mx-4 transform animate-slideUp">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to our Blog!
            </h2>
            <p className="text-gray-500 mt-1">
              Discover content that suits you
            </p>
          </div>
          <button
            id="skipBtn"
            className="text-gray-400 hover:text-gray-600 text-sm px-4 py-2 rounded-full hover:bg-gray-100 transition-all duration-200"
          >
            Skip →
          </button>
        </div>

        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
          Please select at least one category you are interested in so we can
          suggest relevant content:
        </p>

        <div
          id="categoryContainer"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8"
        >
          {categories.map((category, index) => (
            <div
              key={category._id}
              onClick={() => toggleCategory(category._id as string)}
              className={`category-item group p-6 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 ${
                selectedCategories.includes(category._id as string)
                  ? "bg-gradient-to-br from-blue-100 to-indigo-200 border-blue-400"
                  : "bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-100 border-gray-200 hover:border-blue-300"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <h3
                className={`font-semibold text-center transition-colors ${
                  selectedCategories.includes(category._id as string)
                    ? "text-blue-700"
                    : "text-gray-800 group-hover:text-blue-700"
                }`}
              >
                {category.name}
              </h3>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Select at least 1 category to continue
          </p>
          <button
            id="confirmBtn"
            onClick={handleConfirm}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            disabled={selectedCategories.length === 0}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
