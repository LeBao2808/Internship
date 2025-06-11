"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../components/Footer";
import UserButton from "../../admin/UserButton";

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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  const [isMobile, setIsMobile] = useState(false);
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  // const savedSearch = localStorage.getItem("blog_search") || "";
  useEffect(() => {
    const fetchUserNames = async () => {
      const ids = Array.from(
        new Set(
          blogs
            .map((b) =>
              typeof b.user === "object" && b.user !== null && "_id" in b.user
                ? b.user._id
                : b.user || ""
            )
            .filter(Boolean)
        )
      );
      const newUserNames: { [key: string]: string } = { ...userNames };
      for (const id of ids) {
        if (id && !newUserNames[id]) {
          const res = await fetch(`/api/user/${id}`);
          const data = await res.json();
          newUserNames[id] = data?.name || id;
        }
      }
      setUserNames(newUserNames);
    };
    if (blogs.length > 0) fetchUserNames();
  }, [blogs]);

  // Lấy featured posts (giả lập: 3 bài đầu tiên)
  const featuredPosts = blogs.slice(0, 3);
  // Latest posts (giả lập: 3 bài mới nhất)
  const latestPosts = blogs.slice(0, 3);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/category");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(
          data.map((cat: any) => ({ _id: cat._id, name: cat.name }))
        );
      } else if (Array.isArray(data.categories)) {
        setCategories(
          data.categories.map((cat: any) => ({ _id: cat._id, name: cat.name }))
        );
      } else {
        setCategories([]);
      }
    } catch {
      setCategories([]);
    }
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: limit.toString(),
        ...(category ? { category } : {}),
      });

      const res = await fetch(`/api/blog?${params.toString()}`);
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
    // This code only runs on the client
    // const savedSearch = typeof window !== "undefined" ? localStorage.getItem("blog_search") || "" : "";
    // setSearch(savedSearch);
    // if (typeof window !== "undefined") {
    //   localStorage.removeItem("blog_search");
    // }
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [search, page, category, router]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className={`blog-home-bg min-h-screen px-5  sm:px-2 md:px-0`}>
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="flex w-full justify-end">
          {/* <button
            className=" py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition w-[200px] cursor-pointer border-10 border-blue-600 hover:border-blue-700 "
            onClick={() => router.push("/authen/login")}
          >
            Login
          </button> */}
          <UserButton />
        </div>
        {isMobile ? (
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-extrabold mb-2 text-gray-900 drop-shadow-lg leading-tight">
              Learn to Code
              <br />
              One Day at a Time
            </h3>

            <p className="text-sm md:text-base text-gray-600 mb-2">
              A blog for beginners and aspiring developers to grow their coding
              skills.
            </p>
          </div>
        ) : (
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-gray-900 drop-shadow-lg leading-tight">
              Learn to Code
              <br />
              One Day at a Time
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              A blog for beginners and aspiring developers to grow their coding
              skills.
            </p>
          </div>
        )}

        {/* Featured Posts */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Featured Posts
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></span>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center text-gray-500 py-12 text-lg">
              No blog found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((blog, idx) => (
                <div
                  key={blog._id}
                  className="bg-white rounded-xl shadow-lg p-6 flex flex-col border border-gray-100 hover:border-blue-400 transition group cursor-pointer"
                  onClick={() => router.push(`/UI/blog/${blog.slug}`)}
                >
                  <h3 className="text-lg font-bold mb-2 text-gray-800 group-hover:text-blue-700 transition">
                    {blog.title}
                  </h3>
                  <div
                    className="text-gray-600 mb-3 line-clamp-3"
                    dangerouslySetInnerHTML={{
                      __html:
                        blog.content && blog.content.length > 90
                          ? blog.content.slice(0, 90) + "..."
                          : blog.content || "",
                    }}
                  />
                  <div className="flex flex-wrap gap-2 mb-4">
                    {blog.category && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {blog.category.name}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => router.push(`/UI/blog/${blog.slug}`)}
                    // onClick={handleViewDetail}
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
          {/* <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={handleSearchChange}
            className="p-3 w-full md:w-80 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          /> */}

          <div className="flex px-6 py-3 rounded-md border-2 border-blue-500 overflow-hidden bg-white ">
            <input
              // type="email"
              placeholder="Search Something..."
              onChange={handleSearchChange}
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
          <div className="flex justify-center items-center h-40">
            <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></span>
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
                  {blog.image_url ? (
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="h-auto aspect-[8/5] w-full object-cover"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <svg
                      className="h-auto aspect-[8/5] w-full text-blue-400 opacity-40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6l4 2"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1 flex flex-col p-6">
                  <h2 className="text-2xl font-bold mb-2 text-gray-800 group-hover:text-blue-700 transition">
                    {blog.title}
                  </h2>
                  {blog.user && (
                    <p className="text-sm text-gray-500 mb-1">
                      <b>Tác giả:</b>{" "}
                      {typeof blog.user === "object" &&
                      blog.user !== null &&
                      "name" in blog.user
                        ? blog.user.name
                        : userNames[blog.user as string] || blog.user}
                    </p>
                  )}
                  {blog.createdAt && (
                    <p className="text-xs text-gray-400 mb-2">
                      Đăng lúc: {new Date(blog.createdAt).toLocaleString()}
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
            className="px-4 py-2 bg-gray-200 rounded-lg font-medium disabled:opacity-50 hover:bg-gray-300 transition"
          >
            Previous
          </button>
          <span className="text-gray-700 font-semibold">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="px-4 py-2 bg-gray-200 rounded-lg font-medium disabled:opacity-50 hover:bg-gray-300 transition"
          >
            Next
          </button>
        </div>
      </div>

      <style jsx global>{`
        .blog-home-bg {
          padding-top: 20px;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
      <Footer />
    </div>
  );
}

{
  /* <div className="w-full bg-white shadow-sm mb-8">
  <nav className="max-w-5xl mx-auto flex items-center justify-between py-4 px-4 md:px-0">
    <div className="text-xl md:text-2xl font-bold text-gray-900">Programming Blog</div>
    <div className="flex gap-6 text-base font-medium">
      <button className="hover:text-blue-600 transition" onClick={()=>router.push('/webapp/UI/blog')}>Home</button>
      <button className="hover:text-blue-600 transition" onClick={()=>router.push('/webapp/UI/blog/about')}>About</button>
    </div>
  </nav>
</div> */
}
