"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import "../../../css/style.css";

interface Blog {
  _id: string;
  title: string;
  content: string;
  user?: string;
  image_url?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function BlogDetailPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState<string>("");

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/blog/${id}`);
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
    if (id) fetchBlog();
  }, [id]);

  if (loading) return    <div className="flex justify-center items-center h-40">
  <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></span>
</div>;
  if (!blog) return <div className="p-8 text-center">Blog not found.</div>;

  return (
    <div className="max-w-3xl mx-auto blog-home-bg p-6 md:p-12 bg-white rounded-xl shadow-lg mt-12 mb-12">
      {/* Ảnh đại diện blog nếu có */}
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
  );
}