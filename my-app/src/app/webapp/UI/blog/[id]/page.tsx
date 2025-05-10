"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Blog {
  _id: string;
  title: string;
  content: string;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function BlogDetailPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/blog/${id}`);
        const data = await res.json();
        if (data && !data.error) {
          setBlog(data);
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

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!blog) return <div className="p-8 text-center">Blog not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded shadow mt-8">
      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
      <div className="mb-2 text-gray-500">
        {blog.user && <span className="mr-4">Author: {blog.user}</span>}
        {blog.createdAt && (
          <span>
            Created at: {new Date(blog.createdAt).toLocaleString()}
          </span>
        )}
      </div>
      <div className="mt-6 text-lg">{blog.content}</div>
    </div>
  );
}