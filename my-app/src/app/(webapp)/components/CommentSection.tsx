"use client";

// components/CommentSection.tsx
import { useState, useEffect } from "react";
// First install the package:
// npm install lucide-react
// or
// yarn add lucide-react
import { formatDistanceToNow } from "date-fns";
import { Send } from "lucide-react";

interface Comment {
  _id: string;
  user: {
    name: string;
    image?: string;
  };
  content: string;
  createdAt: Date | string;
}

interface CommentSectionProps {
  slug: string;
}
export default function CommentSection({ slug }: CommentSectionProps) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const imageUrl = "/BlueHead.png";

  // useEffect(() => {
  //   // Khi slug thay đổi, reset tất cả state liên quan đến comment
  //   setComment("");
  //   setComments([]);
  //   setSearch("");
  //   setCurrentPage(1);
  // }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [search, currentPage, pageSize, sortBy, sortOrder]);

  const handleSubmit = () => {
    // if (comment.trim()) {
    //   const newComment: Comment = {
    //     id: Date.now(),
    //     user: {
    //       name: "Người dùng ẩn danh",
    //       image: "", // Bạn có thể để đường dẫn ảnh ở đây
    //     },
    //     content: comment,
    //     createdAt: new Date(),
    //   };
    //   setComments([...comments, newComment]);
    //   setComment("");
    // }
  };

  const fetchComments = async () => {
    const size = 5;
    try {
      setLoading(true);
      let url = "/api/comment";
      const params = [];
      if (slug) params.push(`search=${encodeURIComponent(slug)}`);
      if (size) params.push(`pageSize=${size}`);

      if (params.length > 0) url += "?" + params.join("&");

      const res = await fetch(url);
      const data = await res.json();
      setComments(Array.isArray(data.comments) ? data.comments : []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-full mx-auto mt-10 p-4 bg-gray-50 rounded-2xl border border-gray-200 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">💬 Comments</h2>

      <div className="flex mt-4 gap-2 items-center border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 px-4 py-2 rounded-xl mb-3">
        <input
          type="text"
          placeholder="Nhập bình luận..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="flex-1 border-none outline-none"
        />
        <Send className="cursor-pointer" size={16} onClick={handleSubmit} />
      </div>

      <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
        {comments.map((cmt) => (
          <div key={cmt._id} className="flex gap-3 items-start mb-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold text-sm my-auto">
              <img
                src={cmt?.user?.image || imageUrl}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>

            <div className="bg-gray-100 p-3 rounded-xl text-sm flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold">{cmt.user.name}</span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(cmt.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className="break-words">{cmt.content}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
