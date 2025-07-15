import { getServerSession } from "next-auth";
import { authOptions } from "@/resources/lib/auth.config";
import dbConnect from "@/resources/lib/mongodb";
import Blog from "@/app/api/models/Blog";
import Category from "@/app/api/models/Category";
import User from "@/app/api/models/User";
import Comment from "@/app/api/models/Comment";
import { getCachedChatBot, setCachedChatBot } from "./cache";
import { ragService } from "./ragService";

interface SystemData {
  blogCount: number;
  categoryCount: number;
  userCount: number;
  categories: any[];
  commentCount: number;
}

export class ChatbotService {
  async getSystemData(): Promise<SystemData> {
    const cached = await getCachedChatBot();

    
    if (cached) {
      console.log("Using cached system data");
      return typeof cached === 'string' ? JSON.parse(cached) : cached as SystemData;
    }

    await dbConnect();
    const [blogCount, categoryCount, userCount, categories, commentCount] = await Promise.all([
      Blog.countDocuments({ isDelete: false }),
      Category.countDocuments(),
      User.countDocuments({ isDelete: false }),
      Category.find().select("name description").lean(),
      Comment.countDocuments({ isDelete: false }),
    ]);

    const data = { blogCount, categoryCount, userCount, categories, commentCount };
    await setCachedChatBot(data);
    return data;
  }

  async getRelatedBlogs(question: string) {
    await ragService.initializeIfNeeded();
    const relatedBlogIds = await ragService.findRelatedBlogs(question, 3);
    return relatedBlogIds.length > 0
      ? await Blog.find({ _id: { $in: relatedBlogIds } })
          .populate('category', 'name')
          .populate('user', 'name')
      : [];
  }

  buildSystemContext(systemData: SystemData, relatedBlogs: any[], session: any) {
    return `
Hệ thống blog hiện tại có:
- Tổng số bài viết ${systemData.blogCount} bài viết
- Tổng số danh mục ${systemData.categoryCount} danh mục
- Tổng số người dùng ${systemData.userCount} người dùng
- Tổng số bình luận ${systemData.commentCount} bình luận
- Người tạo ra trang web này là Bảo Lê
- Người dùng hiện tại: ${session?.user?.name || 'Khách'}

Bài viết có liên quan:
${relatedBlogs.length > 0 ? relatedBlogs
  .map((blog: any) => `  - ${blog.title} -  (${blog.category?.name || 'Chưa phân loại'})`)  
  .join("\n") : 'Không tìm thấy bài viết trong hệ thống'}

Các danh mục: ${systemData.categories.length > 0 ? systemData.categories.map((c: any) => c.name).join(", ") : 'Chưa có danh mục nào'}
    `;
  }

  async callGemini(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBLhFqhZHJqaOcF1ogQcVLmctB9qw5shBM",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 500,    // Giới hạn độ dài
              temperature: 0.7,        // Giảm creativity = nhanh hơn
            }
          }),
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 
             "Xin lỗi, tôi chưa có câu trả lời cho câu hỏi này.";
    } catch (error) {
      clearTimeout(timeoutId);
      if (error === 'AbortError') {
        return "Phản hồi quá chậm, vui lòng thử lại.";
      }
      throw error;
    }
  }

  convertToClickableLinks(answer: string, relatedBlogs: any[]): string {
    if (!relatedBlogs?.length) return answer;
    
    relatedBlogs.forEach((blog: any) => {
      const titleRegex = new RegExp(blog.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      answer = answer.replace(titleRegex, `[${blog.title}](/${blog.slug})`);
    });
    
    return answer;
  }
}

export const chatbotService = new ChatbotService();