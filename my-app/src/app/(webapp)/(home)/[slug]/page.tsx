"use client";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import CommentSection from "../../../../components/CommentSection";
import Footer from "../../../../components/Footer";
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
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState<string>("");
  const [latestBlogs, setLatestBlogs] = useState<Blog[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<
    { id: string; text: string; level: number }[]
  >([]);
  const { data: session } = useSession();
  const viewedRef = useRef(false);

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
  useEffect(() => {
    const fetchRelatedBlogs = async () => {
      if (!blog?.category) return;
      try {
        const res = await fetch(
          `/api/bloghome?category=${encodeURIComponent(blog.category)}&limit=5`
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
  }, [blog?.category, slug]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const contentWithIds = useMemo(() => {
    if (!blog?.content) return "";
    let idx = 0;
    return blog.content.replace(
      /<(h[1-6])([^>]*)>(.*?)<\/h[1-6]>/gi,
      (match, tag, attrs, text) => {
        const id = toc[idx]?.id || `toc-heading-${idx}`;
        idx++;
        return `<${tag}${attrs} id="${id}">${text}</${tag}>`;
      }
    );
  }, [blog?.content, toc]);

  useEffect(() => {
    if (!blog || !session?.user) return;

    const fetchUserIdAndSaveView = async () => {
      const userRes = await fetch(`/api/user/?search=${session?.user?.email}`);
      const userData = await userRes.json();
      const userId = userData.users[0]?._id || session?.user?.id;

      const checkAndSaveView = async () => {
        const res = await fetch(
          `/api/view-history?user=${userId}&blog=${blog._id}`
        );
        let data = [];
        if (res.ok) {
          try {
            data = await res.json();
          } catch {
            data = [];
          }
        }
        if (!data || data.length === 0) {
          await fetch("/api/view-history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: userId, blog: blog._id }),
          });
        }
      };

      const handleScroll = () => {
        if (
          !viewedRef.current &&
          contentRef.current &&
          window.innerHeight + window.scrollY >=
            contentRef.current.offsetTop + contentRef.current.offsetHeight - 100
        ) {
          viewedRef.current = true;
          checkAndSaveView();
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    };

    fetchUserIdAndSaveView();
  }, [blog, session]);

  if (loading)
    return (
          <div className="max-w-7xl mx-auto min-h-screen mt-10 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg animate-pulse" style={{ marginTop: "65px" }}>
        <div className="w-full aspect-[8/5] h-150 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
        <div className="h-4 bg-gray-150 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="flex gap-4">
          <div className="h-32 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-32 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-32 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        </div>
      </div>
    );
  if (!blog) return <div className="p-8 text-center">Blog not found.</div>;

   return (
    <div className="bg-gray-100 dark:bg-[#121618] min-h-screen">
      <div
        className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 mt-6 mb-6 px-2 sm:px-4 md:px-8"
        style={{ marginTop: "65px" }}
      >
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 md:p-12">
            {blog.image_url ? (
              <div className="mb-6 sm:mb-8">
                <img
                  src={blog.image_url}
                  alt={blog.title}
                  className="w-full h-150 aspect-[8/5] object-cover rounded-lg shadow"
                />
              </div>
            ) : null}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 text-gray-900 dark:text-white leading-tight">
              {blog.title}
            </h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-8 text-gray-600 dark:text-gray-400 text-sm gap-3 sm:gap-6">
              {blog.user && (
                <span className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">{authorName || blog.user}</span>
                </span>
              )}
              {blog.createdAt && (
                <span className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full">
                  <svg
                    className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">
                    {new Date(blog.createdAt).toLocaleString()}
                  </span>
                </span>
              )}
            </div>

            <div
              ref={contentRef}
              className="prose prose-sm sm:prose-lg max-w-none mt-6 sm:mt-8 text-gray-800 leading-relaxed dark:prose-invert dark:text-gray-200"
              dangerouslySetInnerHTML={{ __html: contentWithIds }}
            />
         <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent mt-12 mb-8"></div>
            <div className="max-w-6xl mx-auto mt-8 px-2 sm:px-0 md:px-2">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-blue-600 dark:from-gray-200 dark:to-blue-400 bg-clip-text text-transparent">
                Related articles
              </h2>
              <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-4">
                {latestBlogs.length > 0 ? (
                  latestBlogs.map((item) => (
                    <a
                      key={item.slug}
                      href={`/${item.slug}`}
                      className="group min-w-[220px] sm:min-w-[280px] max-w-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl p-4 sm:p-5 flex-shrink-0 transition-all duration-500 hover:scale-105 border border-white/20 dark:border-gray-700/30 hover:border-blue-200 dark:hover:border-blue-600/50"
                    >
                      {item.image_url ? (
                        <div className="relative overflow-hidden rounded-xl mb-3">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-32 sm:h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      ) : (
                        <div className="w-full h-32 sm:h-40 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl mb-3 flex items-center justify-center">
                          <svg className="w-12 h-12 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                          </svg>
                        </div>
                      )}
                      <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
                      </p>
                    </a>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm dark:text-gray-500">
                    There are no posts.
                  </div>
                )}
              </div>
            </div>
            <CommentSection slug={slug} />
          </div>
        </div>
      </div>
      <Footer />

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-blue-600 text-white p-3 rounded-full shadow-2xl hover:bg-blue-700 hover:scale-110 transition-all duration-200 flex items-center justify-center cursor-pointer"
          aria-label="Scroll to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
