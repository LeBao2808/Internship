"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Blog {
  _id: string;
  title: string;
  content: string;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showContent, setShowContent] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: limit.toString(),
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
    fetchBlogs();
    // eslint-disable-next-line
  }, [search, page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  const handleToggleContent = (id: string) => {
    setShowContent((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="blog-home-bg min-h-screen py-10 px-2 md:px-0">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900 drop-shadow-lg">Blog List</h1>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={search}
            onChange={handleSearchChange}
            className="p-3 w-full md:w-80 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></span>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center text-gray-500 py-12 text-lg">Không tìm thấy bài viết nào.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="group bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col transition transform hover:-translate-y-1 hover:shadow-2xl border border-gray-100 hover:border-blue-400"
              >
                <div className="h-48 w-full bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center">
                  <svg className="w-20 h-20 text-blue-400 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
                </div>
                <div className="flex-1 flex flex-col p-6">
                  <h2 className="text-2xl font-bold mb-2 text-gray-800 group-hover:text-blue-700 transition">{blog.title}</h2>
                  {blog.user && (
                    <p className="text-sm text-gray-500 mb-1">
                      <b>Tác giả:</b> {blog.user}
                    </p>
                  )}
                  {blog.createdAt && (
                    <p className="text-xs text-gray-400 mb-2">
                      Đăng lúc: {new Date(blog.createdAt).toLocaleString()}
                    </p>
                  )}
                  <div className="text-gray-600 mb-4 line-clamp-3">
                    {blog.content?.slice(0, 120)}{blog.content && blog.content.length > 120 ? "..." : ""}
                  </div>
                  <button
                    onClick={() => router.push(`/webapp/UI/blog/${blog._id}`)}
                    className="mt-auto px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow"
                  >
                    Đọc tiếp
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
            Trang trước
          </button>
          <span className="text-gray-700 font-semibold">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="px-4 py-2 bg-gray-200 rounded-lg font-medium disabled:opacity-50 hover:bg-gray-300 transition"
          >
            Trang sau
          </button>
        </div>
      </div>
      <style jsx global>{`
        .blog-home-bg {
          background: linear-gradient(120deg, #f0f4ff 0%, #e6ecfa 100%);
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}