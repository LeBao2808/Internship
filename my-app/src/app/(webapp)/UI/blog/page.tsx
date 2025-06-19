"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../components/Footer";
import UserButton from "../../admin/UserButton";
import { useSession } from "next-auth/react";
import Image from "next/image";
import "./style.css";

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

  console.log("blogFeatured", blogFeatureds);
  const featuredPosts = useMemo(
    () => blogFeatureds.slice(0, 3),
    [blogFeatureds]
  );
  const latestPosts = useMemo(() => blogs.slice(0, 3), [blogs]);

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
setLoading(true)
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

  const handleSearchChange = (value:string) => {
    setSearch(value);
    setPage(1);
  };

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSearchValue(e.target.value);
};

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") {
    handleSearchChange(searchValue); // Hàm riêng để xử lý tìm kiếm
  }
};

  const totalPages = Math.ceil(total / limit);

  return (
    <div className={`blog-home-bg min-h-screen px-5  sm:px-2 md:px-0`}>
      <div className="flex justify-end ">
        <div className="flex items-center bg-white rounded-lg shadow-sm mr-2 mt-2 p-1 absolute right-0 top-0">
          <UserButton />
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16">
        {/* Hero Section */}
        <div className="flex w-full justify-end"></div>
        <div className="text-center mb-12">
          <h1 className="title font-extrabold mb-4 text-gray-900 drop-shadow-lg leading-tight">
            Learn to Code
            <br />
            One Day at a Time
          </h1>
          <p className="sub_title text-gray-600 mb-8 max-w-2xl mx-auto">
            A blog for beginners and aspiring developers to grow their coding
            skills.
          </p>
        </div>

        {/* Featured Posts */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Featured Posts
          </h2>
          {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="bg-white h-[250px] rounded-xl shadow-lg p-6 flex flex-col border border-gray-100 animate-pulse"
      >
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>

        {/* Content lines */}
        <div className="flex-grow min-h-0 space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>

        {/* Category tag placeholder */}
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>

        {/* Read more button */}
        <div className="mt-auto h-8 bg-gray-200 rounded w-1/3"></div>
      </div>
    ))}
  </div>
          ) : (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {featuredPosts.map((blog) => (
    <div
      key={blog._id}
      className="bg-white h-[250px] rounded-xl shadow-lg p-6 flex flex-col border border-gray-100 hover:border-blue-400 transition group cursor-pointer"
      onClick={() => router.push(`/UI/blog/${blog.slug}`)}
    >
      <div className="flex-grow min-h-0"> {/* Giữ cho nội dung bên trong không bị tràn */}
        <h3 className="text-lg font-bold mb-2 text-gray-800 group-hover:text-blue-700 transition truncate">
          {blog.title}
        </h3>
        
        <div
          className="text-gray-600 mb-3 line-clamp-3 overflow-hidden"
          dangerouslySetInnerHTML={{
            __html:
              blog.content && blog.content.length > 90
                ? blog.content.slice(0, 90) + "..."
                : blog.content || "",
          }}
        />

        <div className="flex flex-wrap gap-2 mb-4 mt-auto">
          {blog.category && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              {blog.category.name}
            </span>
          )}
        </div>
      </div>
                  <button
                    onClick={() => router.push(`/UI/blog/${blog.slug}`)}
                    className="mt-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow cursor-pointer"
                  >
                    Read More
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Browse by Category */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Browse by Category</h2>
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
              All Category
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                className={`px-4 py-2 border-2 rounded-lg font-medium transition cursor-pointer ${
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
          <h2 className="text-2xl font-bold mb-4">Latest Posts</h2>
          <div className="bg-white rounded-xl shadow divide-y divide-gray-200">
            {latestPosts.map((blog) => (
              <div
                key={blog._id}
                className="flex items-center px-6 py-4 hover:bg-blue-50 transition cursor-pointer"
                onClick={() => router.push(`/UI/blog/${blog.slug}`)}
              >
                <svg
                  className="w-6 h-6 text-blue-500 mr-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {blog.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {blog.createdAt
                      ? new Date(blog.createdAt).toLocaleDateString()
                      : ""}
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 ml-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            ))}
          </div>
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
      <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
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
                onClick={() => router.push(`/UI/blog/${blog.slug}`)}
                key={blog._id}
                className="group bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col transition transform hover:-translate-y-1 hover:shadow-2xl border border-gray-100 hover:border-blue-400 cursor-pointer"
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
                  <h2 className="text-2xl font-bold mb-2 text-gray-800 group-hover:text-blue-700 transition">
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
                    onClick={() => router.push(`/UI/blog/${blog.slug}`)}
                    className="mt-auto px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow cursor-pointer"
                  >
                    Read more
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
            className="px-4 py-2 bg-gray-200 rounded-lg font-medium disabled:opacity-50 hover:bg-gray-300 transition cursor-pointer"
          >
            Previous
          </button>
          <span className="text-gray-700 font-semibold cursor-pointer">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="px-4 py-2 bg-gray-200 rounded-lg font-medium disabled:opacity-50 hover:bg-gray-300 transition cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
