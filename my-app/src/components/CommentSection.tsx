"use client";

import { useState, useEffect, use } from "react";
import { formatDistanceToNow } from "date-fns";
import { Send } from "lucide-react";
import { useSession } from "next-auth/react";
import socket from "@/resources/lib/socket";
import generateSlug from "@/utils/generateSlug";

interface CommentSectionProps {
  slug: string;
}
interface Comment {
  user: {
    name: string;
    image?: string;
  };
  content: string;
  createdAt: string | Date;
}

export default function CommentSection({ slug }: CommentSectionProps) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const rawSlug = decodeURIComponent(slug);
  const [visibleComments, setVisibleComments] = useState(10);

  useEffect(() => {
    console.log("slug s", rawSlug);
    fetchComments();
  }, [slug]);
  useEffect(() => {
    console.log("abc");
    socket.on("receiveComment", (newComment: Comment) => {
      console.log(newComment);
      setComments((prev) => [newComment, ...prev]);
    });
  }, [socket]);

  // Fetch danh sách bình luận hiện tại
  const fetchComments = async () => {
    try {
      console.log("fetchComments", generateSlug(rawSlug));
      setLoading(true);
      const res = await fetch(
        `/api/comment?search=${encodeURIComponent(rawSlug)}&isComment=true`
      );
      const data = await res.json();
      if (res.ok && Array.isArray(data.comments)) {
        setComments(data.comments);
      } else {
        console.error(
          "Lỗi fetch comments:",
          data.message || "Không thể lấy dữ liệu"
        );
        setComments([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Không tải được bình luận.");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreComments = () => {
    setVisibleComments((prev) => prev + 10);
  };


  console.log("comments", comments);

  // Gửi bình luận lên server qua API
  const handleSubmit = async () => {
    setComment("");
    if (!session?.user) {
      alert("Bạn cần đăng nhập để bình luận.");
      return;
    }

    if (!comment.trim()) {
      alert("Bình luận không được để trống.");
      return;
    }

    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: comment,
          slug,
        }),
      });
      const data = await res.json();

      if (res.ok) {
      } else {
        alert(data.error || "Đăng bình luận thất bại");
      }
    } catch (error) {
      console.error("Lỗi gửi bình luận:", error);
      alert("Gửi bình luận thất bại.");
    }
  };

  return (
    <div className="max-full mx-auto mt-10 p-4 bg-gray-50 rounded-2xl border border-gray-200 shadow-lg dark:bg-gray-900 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">
        💬 Comments
      </h2>

      {/* Input */}
      <div className="relative flex mt-4 gap-2  border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 px-4 py-2 rounded-xl mb-3 dark:bg-gray-800 dark:border-gray-700">
        <textarea
          placeholder={
            session?.user ? "Enter comment..." : "Please login to comment"
          }
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e: any) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              setComments((prev) => [
                {
                  user: {
                    name: session?.user?.name || "",
                    image: session?.user?.image || "",
                  },
                  content: comment,
                  createdAt: new Date(),
                },
                ...prev,
              ]);
              socket.emit("sendComment", {
                content: comment,
                slug,
                user: {
                  name: session?.user?.name,
                  image: session?.user?.image,
                },
                createdAt: new Date(),
              });
              handleSubmit();
            }
          }}
          disabled={!session?.user}
          rows={4}
          className="flex-1 border-none outline-none bg-transparent resize-none dark:text-white"
        />
        <Send
          className={`${
            session?.user
              ? "cursor-pointer text-blue-500 hover:text-blue-700"
              : "cursor-not-allowed text-gray-400"
          } transition absolute right-3 bottom-3`}
          size={20}
          onClick={() => {
            if (session?.user) {
              setComments((prev) => [
                {
                  user: {
                    name: session?.user?.name || "",
                    image: session?.user?.image || "",
                  },
                  content: comment,
                  createdAt: new Date(),
                },
                ...prev,
              ]);
              socket.emit("sendComment", {
                content: comment,
                slug,
                user: {
                  name: session?.user?.name,
                  image: session?.user?.image,
                },
                createdAt: new Date(),
              });
              handleSubmit();
            }
          }}
        />
      </div>

      {/* Danh sách bình luận */}
      <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
        {loading ? (
          <p className="dark:text-gray-300">Loading Comment...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 italic dark:text-gray-400">
            No comments yet.
          </p>
        ) : (
          <>
            {comments.slice(0, visibleComments).map((cmt, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 my-auto dark:bg-gray-700">
                  <img
                    src={cmt.user.image || "/BlueHead.png"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>

                <div className="bg-gray-100 p-3 rounded-xl text-sm flex-1 dark:bg-gray-800 w-[200px]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold dark:text-white">
                      {cmt.user.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(cmt.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <div className="break-words dark:text-gray-200">
                    {cmt.content}
                  </div>
                </div>
              </div>
            ))}
            {comments.length > visibleComments && (
              <div className="text-center mt-4">
                <button
                  onClick={loadMoreComments}
                  className="text-blue-500 hover:text-blue-700 font-medium text-sm cursor-pointer"
                >
                  Load more comments
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
