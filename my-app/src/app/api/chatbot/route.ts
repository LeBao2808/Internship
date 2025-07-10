import { NextResponse } from "next/server";
import dbConnect from "@/resources/lib/mongodb"
import { getCachedChatBot, setCachedChatBot } from "@/utils/cache";
import Blog from "@/app/api/models/Blog";
import Category from "@/app/api/models/Category";
import User from "@/app/api/models/User";
import Comment from "../models/Comment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/resources/lib/auth.config";


export async function POST(req: Request) {
  const { question, context } = await req.json();

  try {
    // Try to get cached system context
    const systemData = await getCachedChatBot();
    let blogCount, categoryCount, userCount, recentBlogs, categories, commentCount;
      const session = await getServerSession(authOptions);
    if (!systemData) {
      await dbConnect();

      // Get system information
      [
        blogCount,
        categoryCount,
        userCount,
        recentBlogs,
        categories,
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
        Comment.countDocuments({ isDelete: false }),
      ]);
      
      const contextData = {
        blogCount,
        categoryCount,
        userCount,
        recentBlogs,
        categories,
        commentCount
      };
      
      await setCachedChatBot(contextData);
    } else {
      console.log("Using cached system context");
      if (typeof systemData === 'string') {
        ({ blogCount, categoryCount, userCount, recentBlogs, categories, commentCount } = JSON.parse(systemData));
      } else {
        ({ blogCount, categoryCount, userCount, recentBlogs, categories, commentCount } = systemData as any);
      }
    }

    // Ensure arrays are defined
    recentBlogs = recentBlogs || [];
    categories = categories || [];

    const systemContext = `
Hệ thống blog hiện tại có:
- Tổng số bài viết ${blogCount} bài viết
- Tổng số danh mục ${categoryCount} danh mục
- Tổng số người dùng ${userCount} người dùng
- Tổng số bình luận ${commentCount} bình luận
- Người tạo ra trang web này là Bảo Lê
- Người dùng hiện tại: ${session?.user?.name || 'Khách'}
- Danh sách bài viết gần đây:
${recentBlogs.length > 0 ? recentBlogs
  .map(
    (blog: any) =>
      `  - ${blog.title} (Tác giả: ${blog.user?.name || 'Không rõ'}, Danh mục: ${blog.category?.name || 'Chưa phân loại'}, Bình luận: ${blog.comments || 0})`
  )
  .join("\n") : 'Chưa có bài viết nào'}


Các danh mục: ${categories.length > 0 ? categories.map((c: any) => c.name).join(", ") : 'Chưa có danh mục nào'}
    `;

       const prompt = `Bạn là trợ lý AI của trang web BlogDev, hãy trả lời ngắn gọn, theo câu hỏi của người dùng nhưng mà phải dễ thương :), dễ hiểu cho người dùng bằng tiếng Việt${systemContext}
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
    if (recentBlogs && recentBlogs.length > 0) {
      recentBlogs.forEach((blog: any) => {
        const titleRegex = new RegExp(blog.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        answer = answer.replace(titleRegex, `[${blog.title}](/${blog.slug})`);
      });
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Chatbot error:", error);
    return NextResponse.json({
      answer: "Có lỗi xảy ra, vui lòng thử lại sau.",
    });
  }
}

