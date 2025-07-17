export const CHATBOT_PROMPTS = {
  MAIN_ASSISTANT: (systemContext: string, context?: string, question?: string) => `
Bạn là trợ lý AI của trang web BlogDev, hãy trả lời ngắn gọn, theo câu hỏi đúng ý chính của người dùng nhưng mà phải lịch sự dễ thương, dễ hiểu cho người dùng bằng tiếng Việt${systemContext}
${context ? `Thông tin bổ sung: ${context}` : ""}
Câu hỏi: ${question}
Trả lời:
  `,

  BLOG_RECOMMENDATION: (userPreferences: string, categories: string[]) => `
Bạn là chuyên gia gợi ý nội dung blog. Dựa trên sở thích của người dùng: "${userPreferences}" và các danh mục có sẵn: ${categories.join(", ")}, hãy gợi ý 3-5 chủ đề blog phù hợp.
  `,

  CONTENT_SUMMARY: (content: string) => `
Hãy tóm tắt nội dung sau đây thành 2-3 câu ngắn gọn, dễ hiểu bằng tiếng Việt:

${content}
  `,
  CATEGORY_EXPLANATION: (categoryName: string, relatedBlogs: string[]) => `
Hãy giải thích về danh mục "${categoryName}" và liệt kê các bài viết liên quan:
${relatedBlogs.map(blog => `- ${blog}`).join('\n')}
  `
};

export const SYSTEM_CONTEXTS = {
  BLOG_STATS: (blogCount: number, categoryCount: number, userCount: number, commentCount: number) => `
Hệ thống blog hiện tại có:
- Tổng số bài viết: ${blogCount} bài viết
- Tổng số danh mục: ${categoryCount} danh mục  
- Tổng số người dùng: ${userCount} người dùng
- Tổng số bình luận: ${commentCount} bình luận

  `,

  USER_CONTEXT: (userName: string, relatedBlogs: any[]) => `
- Người dùng hiện tại: ${userName || 'Khách'}

Bài viết liên quan đến câu hỏi:
${relatedBlogs.length > 0 ? relatedBlogs
  .map((blog: any) => `  - ${blog.title} (${blog.category?.name || 'Chưa phân loại'})`)  
  .join("\n") : 'Không tìm thấy bài viết liên quan'}
  `,

  CATEGORIES_LIST: (categories: any[]) => `
Các danh mục: ${categories.length > 0 ? categories.map((c: any) => c.name).join(", ") : 'Chưa có danh mục nào'}
  `
};