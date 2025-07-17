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
  categories: any[];
}

export class ChatbotService {
  async getSystemData(): Promise<SystemData> {
    const cached = await getCachedChatBot();
    if (cached) {
      console.log("Using cached system data");
      return typeof cached === "string" ? JSON.parse(cached) : (cached as SystemData);
    }
    await dbConnect();
    const categories = await Category.find().select("name description").lean();
    const data = { categories };
    await setCachedChatBot(data);
    return data;
  }
  async getRelatedBlogs(question: string) {
    await ragService.initializeIfNeeded();
    const relatedBlogIds = await ragService.findRelatedBlogs(question);
    return relatedBlogIds.length > 0
      ? await Blog.find({ _id: { $in: relatedBlogIds } })
          .populate("category", "name")
          .populate("user", "name")
      : [];
  }

  async getBlogByTitle(title: string) {
    await dbConnect();
    return await Blog.findOne({
      title: { $regex: title, $options: "i" },
      isDelete: false,
    })
      .populate("category", "name")
      .populate("user", "name");
  }

  async checkForBlogSummary(question: string) {
    const summaryKeywords = [
      "tóm tắt",
      "tổng hợp",
      "nội dung",
      "summary",
      "summarize",
      "content",
    ];
    const hasSummaryRequest = summaryKeywords.some((keyword) =>
      question.toLowerCase().includes(keyword)
    );
    if (hasSummaryRequest) {
      // Use embedding search to find most relevant blog
      const relatedBlogs = await this.getRelatedBlogs(question);
      console.log("Related blogs for summary:", relatedBlogs);
      
      if (relatedBlogs.length > 0) {
        const blog = relatedBlogs[0]; // Take the most relevant one
        const summary = blog.content.length > 300 
          ? blog.content.substring(0, 300) + '...'
          : blog.content;
        return {
          isSummaryRequest: true,
          blog,
          summary: `**Tóm tắt bài viết "${blog.title}":**\n\n${summary}\n\n[Đọc toàn bộ bài viết](/${blog.slug})`
        };
      }
    }
    console.log("No summary request detected");
    return { isSummaryRequest: false };
  }

  buildSystemContext(
    systemData: SystemData,
    relatedBlogs: any[],
    session: any
  ) {
    return `
- Người dùng hiện tại: ${session?.user?.name || "Khách"}

Bài viết có liên quan:
${
  relatedBlogs.length > 0
    ? relatedBlogs
        .map(
          (blog: any) =>
            `  - ${blog.title} -  (${
              blog.category?.name || "Chưa phân loại"
            }) - (Tác giả ${blog.user?.name || "Chưa xác định"})`
        )
        .join("\n")
    : "Không tìm thấy bài viết trong hệ thống"
}

Các danh mục: ${
      systemData.categories.length > 0
        ? systemData.categories.map((c: any) => c.name).join(", ")
        : "Chưa có danh mục nào"
    }
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
              maxOutputTokens: 500, // Giới hạn độ dài
              temperature: 0.7, // Giảm creativity = nhanh hơn
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return (
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "Xin lỗi, tôi chưa có câu trả lời cho câu hỏi này."
      );
    } catch (error) {
      clearTimeout(timeoutId);
      if (error === "AbortError") {
        return "Phản hồi quá chậm, vui lòng thử lại.";
      }
      throw error;
    }
  }

  convertToClickableLinks(answer: string, relatedBlogs: any[]): string {
    if (!relatedBlogs?.length) return answer;

    relatedBlogs.forEach((blog: any) => {
      const titleRegex = new RegExp(
        blog.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "gi"
      );
      answer = answer.replace(titleRegex, `[${blog.title}](/${blog.slug})`);
    });

    return answer;
  }
}

export const chatbotService = new ChatbotService();
