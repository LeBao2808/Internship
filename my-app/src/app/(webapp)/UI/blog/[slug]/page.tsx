"use client";
import { use, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import BlogLayout from "../BlogLayout";
interface Blog {
  _id: string;
  title: string;
  content: string;
  user?: string;
  image_url?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> })
{
    const { slug } = use(params);
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState<string>("");
  const [latestBlogs, setLatestBlogs] = useState<Blog[]>([]); // Thêm state này

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/blog/${slug}`);
        const data = await res.json();
        if (data && !data.error) {
          setBlog(data);
          if (data.user) {
            const userRes = await fetch(`/api/user/${data.user}`);
            const userData = await userRes.json();
            setAuthorName(userData?.name || "");
          }
        } else {
          setBlog(null);
        }
      } catch {
        setBlog(null);
      }
      setLoading(false);
    };
    if (slug) fetchBlog();
  }, [slug]);

  // Fetch related blogs when category or id changes
  useEffect(() => {
    const fetchRelatedBlogs = async () => {
      if (!blog?.category) return;
      try {
        const res = await fetch(`/api/blog?category=${encodeURIComponent(blog.category)}&limit=5`);
        const data = await res.json();
        if (Array.isArray(data.blogs)) {
          setLatestBlogs(data.blogs.filter((b: Blog) => b._id !== id)); // Exclude current blog
        }
      } catch {}
    };
    fetchRelatedBlogs();
  }, [blog?.category, id]);

  if (loading) return <div className="flex justify-center items-center h-40">
    <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></span>
  </div>;
  if (!blog) return <div className="p-8 text-center">Blog not found.</div>;

  return (
    <BlogLayout>
      <div className="max-w-7xl mx-auto flex flex-col gap-8 mt-12 mb-12">
        {/* Nội dung blog */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-12">
            {blog.image_url && (
              <div className="mb-8">
                <img
                  src={blog.image_url}
                  alt={blog.title}
                  className="w-full h-auto aspect-[8/5] object-cover rounded-lg shadow"
                />
              </div>
            )}
            <h1 className="text-4xl font-extrabold mb-4 text-gray-900 leading-tight">{blog.title}</h1>
            <div className="flex items-center mb-6 text-gray-500 text-sm gap-4">
              {blog.user && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {authorName || blog.user}
                </span>
              )}
              {blog.createdAt && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {new Date(blog.createdAt).toLocaleString()}
                </span>
              )}
            </div>
            <div className="prose prose-lg max-w-none mt-8 text-gray-800 leading-relaxed">
              {blog.content}
            </div>
          </div>
        </div>
      </div>
      {/* Thanh trượt bài viết cùng category */}
      <div className="max-w-7xl mx-auto mt-8">
        <h2 className="text-xl font-bold mb-4 text-blue-700">Related articles </h2>
        <div className="flex overflow-x-auto gap-4 pb-2 " >
          {latestBlogs.length > 0 ? (
            latestBlogs.map((item) => (
              <a
                key={item._id}
                href={`/UI/blog/${item._id}`}
                className="min-w-[250px] max-w-xs bg-white rounded-xl shadow-lg p-4 flex-shrink-0 hover:bg-blue-50 transition h-auto aspect-[8/5] w-40"
              >
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                <div className="font-semibold text-gray-900 line-clamp-2">{item.title}</div>
                <div className="text-xs text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</div>
              </a>
            ))
          ) : (
            <div className="text-gray-400 text-sm">Không có bài viết nào.</div>
          )}
        </div>
      </div>
    </BlogLayout>
  );
}