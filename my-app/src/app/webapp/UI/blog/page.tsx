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
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Danh sách Blog</h1>
      <input
        type="text"
        placeholder="Tìm kiếm blog..."
        value={search}
        onChange={handleSearchChange}
        className="p-2 w-full mb-6 border border-gray-300 rounded"
      />
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <>
          {blogs.length === 0 ? (
            <p>Không có blog nào.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <div
                  key={blog._id}
                  className="bg-white rounded-lg shadow p-6 flex flex-col"
                >
                  <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
                  {blog.user && (
                    <p className="text-sm text-gray-500 mb-1">
                      <b>Tác giả:</b> {blog.user}
                    </p>
                  )}
                  {blog.createdAt && (
                    <p className="text-xs text-gray-400 mb-2">
                      Ngày tạo: {new Date(blog.createdAt).toLocaleString()}
                    </p>
                  )}
                  <button
                    onClick={() => router.push(`/webapp/UI/blog/${blog._id}`)}
                    className="mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Xem chi tiết
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Trang trước
            </button>
            <span>
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Trang sau
            </button>
          </div>
        </>
      )}
    </div>
  );
}