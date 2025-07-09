import { NextResponse } from "next/server";
import dbConnect from "@/resources/lib/mongodb";
import Blog from "@/app/api/models/Blog";
import Category from "@/app/api/models/Category";
import User from "@/app/api/models/User";
import Comment from "../models/Comment";

export async function POST(req: Request) {
  const { question, context } = await req.json();

  try {
    await dbConnect();

    // Get system information
    const [
      blogCount,
      categoryCount,
      userCount,
      recentBlogs,
      categories,
      comments,
      commentCount,
    ] = await Promise.all([
      Blog.countDocuments({ isDelete: false }),
      Category.countDocuments(),
      User.countDocuments({ isDelete: false }),
      Blog.aggregate([
        { $match: { isDelete: false } },
        { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" } },
        { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
        { $lookup: { from: "comments", localField: "_id", foreignField: "blog", as: "commentsList" } },
        { $addFields: { 
          comments: { $size: "$commentsList" },
          category: { $arrayElemAt: ["$category", 0] },
          user: { $arrayElemAt: ["$user", 0] }
        }},
        { $project: { title: 1, slug: 1, comments: 1, "category.name": 1, "user.name": 1, createdAt: 1 } },
        { $sort: { createdAt: -1 } },
        { $limit: 15 }
      ]),
      Category.find().select("name description").lean(),
      Comment.find({ isDelete: false })
        .populate("user", "name")
        .sort({ createdAt: -1 })
        .limit(0)
        .lean(),
      Comment.countDocuments({ isDelete: false }),
    ]);

    const systemContext = `
Hệ thống blog hiện tại có:
- Tổng số bài viết ${blogCount} bài viết
- Tổng số danh mục ${categoryCount} danh mục
- Tổng số người dùng ${userCount} người dùng
- Tổng số bình luận ${commentCount} bình luận
- Danh sách bài viết gần đây:
${recentBlogs
  .map(
    (blog) =>
      `  - ${blog.title} (Tác giả: ${blog.user?.name || 'Không rõ'}, Danh mục: ${blog.category?.name || 'Chưa phân loại'}, Bình luận: ${blog.comments || 0})`
  )
  .join("\n")}


Các danh mục: ${categories.map((c) => c.name).join(", ")}
    `;

    const prompt = `
Bạn là trợ lý AI của blog, hãy trả lời ngắn gọn, đúng ý, dễ hiểu cho người dùng bằng tiếng Việt.
${systemContext}
${context ? `Thông tin bổ sung: ${context}` : ""}
Câu hỏi: ${question}
Trả lời:
    `;

    console.log("Prompt:", prompt);

    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBLhFqhZHJqaOcF1ogQcVLmctB9qw5shBM",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    const geminiData = await geminiRes.json();
    let answer =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "Xin lỗi, tôi chưa có câu trả lời cho câu hỏi này.";

    // Convert blog titles to clickable links
    recentBlogs.forEach(blog => {
      const titleRegex = new RegExp(blog.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      answer = answer.replace(titleRegex, `[${blog.title}](/${blog.slug})`);
    });

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Chatbot error:", error);
    return NextResponse.json({
      answer: "Có lỗi xảy ra, vui lòng thử lại sau.",
    });
  }
}
