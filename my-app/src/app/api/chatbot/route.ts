import { NextResponse } from "next/server";
import dbConnect from "@/resources/lib/mongodb"
import { getCachedChatBot, setCachedChatBot } from "@/utils/cache";
import { ragService } from "@/utils/ragService";
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
    const session = await getServerSession(authOptions);
    const systemData = await getCachedChatBot();
    let blogCount, categoryCount, userCount, categories, commentCount;
    
    if (!systemData) {
      await dbConnect();
      [
        blogCount,
        categoryCount,
        userCount,
        categories,
        commentCount,
      ] = await Promise.all([
        Blog.countDocuments({ isDelete: false }),
        Category.countDocuments(),
        User.countDocuments({ isDelete: false }),
        Category.find().select("name description").lean(),
        Comment.countDocuments({ isDelete: false }),
      ]);
      const contextData = { blogCount, categoryCount, userCount, categories, commentCount };
      await setCachedChatBot(contextData);
    } else {
      if (typeof systemData === 'string') {
        ({ blogCount, categoryCount, userCount, categories, commentCount } = JSON.parse(systemData));
      } else {
        ({ blogCount, categoryCount, userCount, categories, commentCount } = systemData as any);
      }
    }
    categories = categories || [];
    // Khởi tạo RAG nếu cần
    await ragService.initializeIfNeeded();
    // Tìm blog liên quan đến câu hỏi
    const relatedBlogIds = await ragService.findRelatedBlogs(question, categoryCount);

    const relatedBlogs = relatedBlogIds.length > 0
      ? await Blog.find({ _id: { $in: relatedBlogIds } })
          .populate('category', 'name')
          .populate('user', 'name')
      : [];

    const systemContext = `
Hệ thống blog hiện tại có:
- Tổng số bài viết ${blogCount} bài viết
- Tổng số danh mục ${categoryCount} danh mục
- Tổng số người dùng ${userCount} người dùng
- Tổng số bình luận ${commentCount} bình luận
- Người tạo ra trang web này là Bảo Lê
- Người dùng hiện tại: ${session?.user?.name || 'Khách'}

Bài viết liên quan đến câu hỏi:
${relatedBlogs.length > 0 ? relatedBlogs
  .map((blog: any) => `  - ${blog.title} (${blog.category?.name || 'Chưa phân loại'})`)  
  .join("\n") : 'Không tìm thấy bài viết liên quan'}

Các danh mục: ${categories.length > 0 ? categories.map((c: any) => c.name).join(", ") : 'Chưa có danh mục nào'}
    `;

       const prompt = `Bạn là trợ lý AI của trang web BlogDev, hãy trả lời ngắn gọn, theo câu hỏi của người dùng nhưng mà phải lịch sự dễ thương, dễ hiểu cho người dùng bằng tiếng Việt${systemContext}
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
    if (relatedBlogs && relatedBlogs.length > 0) {
      relatedBlogs.forEach((blog: any) => {
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

