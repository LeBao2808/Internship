"use client";
import { use, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BlogLayout from "../BlogLayout";
import CommentSection from "../../../components/CommentSection";
interface Blog {
  _id: string;
  title: string;
  content: string;
  user?: string;
  image_url?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  slug?: string;
}

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
    console.log("id", id);
    console.log("slug", slug);
    const fetchRelatedBlogs = async () => {
      if (!blog?.category) return;
      try {
        const res = await fetch(
          `/api/blog?category=${encodeURIComponent(blog.category)}&limit=5`
        );
        const data = await res.json();
        if (Array.isArray(data.blogs)) {
          console.log("data.blogs", data.blogs);
          setLatestBlogs(data.blogs.filter((b: Blog) => b.slug !== slug));
          console.log(
            "setLatestBlogs",
            data.blogs.filter((b: Blog) => b.slug !== slug)
          );
        }
      } catch {}
    };
    fetchRelatedBlogs();
  }, [blog?.category, id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></span>
      </div>
    );
  if (!blog) return <div className="p-8 text-center">Blog not found.</div>;

  return (
    <BlogLayout>
      <div className="max-w-6xl mx-auto flex flex-col gap-8 mt-6 mb-6 px-2 sm:px-4 md:px-8">
        {/* Nội dung blog */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 text-gray-900 leading-tight">
              {blog.title}
            </h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 text-gray-500 text-xs sm:text-sm gap-2 sm:gap-4">
              {blog.user && (
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 inline-block"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {authorName || blog.user}
                </span>
              )}
              {blog.createdAt && (
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 inline-block"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(blog.createdAt).toLocaleString()}
                </span>
              )}
            </div>

            {blog.image_url ? (
              <div className="mb-6 sm:mb-8">
                <img
                  src={blog.image_url}
                  alt={blog.title}
                  className="w-full h-auto aspect-[8/5] object-cover rounded-lg shadow"
                />
              </div>
            ) : null}

            <div
              className="prose prose-sm sm:prose-lg max-w-none mt-6 sm:mt-8 text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
            <hr className="text-gray-100 mt-10" />
            <div className="max-w-6xl mx-auto mt-6 sm:mt-8 px-2 sm:px-0 md:px-2">
              <h2 className="text-xl sm:text-xl font-semibold mb-3 sm:mb-4  ">
                Related articles
              </h2>
              <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-2">
                {latestBlogs.length > 0 ? (
                  latestBlogs.map((item) => (
                    <a
                      key={item.slug}
                      href={`/UI/blog/${item.slug}`}
                      className="min-w-[200px] sm:min-w-[250px] max-w-xs bg-white rounded-xl shadow-lg p-3 sm:p-4 flex-shrink-0 hover:bg-blue-50 transition h-auto aspect-[8/5] w-36 sm:w-40"
                    >
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-24 sm:h-32 object-cover rounded mb-2"
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
                      <div className="font-semibold text-gray-900 line-clamp-2">
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : ""}
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm">
                    Không có bài viết nào.
                  </div>
                )}
              </div>
            </div>
            <CommentSection slug={slug} />
          </div>
        </div>
      </div>
      {/* Thanh trượt bài viết cùng category */}
    </BlogLayout>
  );
}
