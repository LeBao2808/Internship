import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/resources/lib/auth.config";
import dbConnect from "@/resources/lib/mongodb";
import Blog from "../../api/models/Blog";
import User from "../models/User";
import ViewHistory from "../models/ViewHistory";
import { redis } from "@/utils/cache";

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ recommendations: [] });
  }

  const userId = session.user.email;
    const cacheKey = `recommendations:${userId}`;

  // Kiểm tra cache trước
  const cached = await redis.get(cacheKey);
  if (typeof cached === "string" && cached.length > 0) {
    console.log("Cache hit for user:", userId);
    return NextResponse.json({ recommendations: JSON.parse(cached) });
  }

  const user = await User.findOne({ email: session.user.email });

  const histories = await ViewHistory.find({ user: user?._id }).populate({
    path: "blog",
    populate: { path: "category", select: "name" },
  });

  console.log("User's view histories:", histories);
  const blogHistorys = histories.map((h) => ({
    name: (h.blog as any)?.title?.toString() || null,
    category: (h.blog as any)?.category?.name?.toString() || null,
  }));

  console.log("Blog histories:", blogHistorys);
  const categoryCount: Record<string, number> = {};
  histories.forEach((h) => {
    const catId = (h.blog as any)?.category?._id?.toString();
    if (catId) categoryCount[catId] = (categoryCount[catId] || 0) + 1;
  });

  const sortedCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .map(([catId]) => catId);

  let blogs: any[] = [];
  if (sortedCategories.length > 0) {
    blogs = await Blog.find({ category: { $in: sortedCategories } })
      .populate("category", "name")
      .populate("user", "name");
  }

  if (blogs.length < 1000000000) {
    const moreBlogs = await Blog.find()
      .populate("category", "name")
      .populate("user", "name");
    const blogIds = new Set(blogs.map((b) => b._id.toString()));
    blogs = blogs.concat(
      moreBlogs.filter((b) => !blogIds.has((b as any)._id.toString()))
    );
  }

  console.log("Blogs fetched:", blogs.length);
  const allTopCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .map(([catId]) => {
      const categoryName = histories.find(
        (h) => (h.blog as any)?.category?._id?.toString() === catId
      );
      return `${
        (categoryName?.blog as any)?.category?.name || "Không xác định"
      } `;
    });
  console.log("All top categories:", allTopCategories);

  const prompt = `
Bạn là hệ thống gợi ý blog thông minh. Nhiệm vụ của bạn là phân tích hành vi đọc của người dùng và đề xuất các bài viết phù hợp nhất.

THÔNG TIN NGƯỜI DÙNG:
- Email: ${user?.email}
- Lịch sử xem: Đã xem ${
    blogHistorys
      .map((h) => `"${h.name}" - Category: ${h.category || "Không phân loại"}`)
      .join(", ") || "Không có lịch sử xem"
  }
- Categories yêu thích theo thứ tự giảm dần: ${allTopCategories.join(", ")}

DANH SÁCH BÀI VIẾT HIỆN CÓ:
${blogs
  .map(
    (b, i) =>
      `${i + 1}. "${b.title}" - Category: ${
        b.category?.name || "Không phân loại"
      }  - Author: ${b.user?.name || "Không xác định"} - Content: ${(
        b.content || ""
      ).substring(0, 100)}...`
  )
  .join("\n")}

TIÊU CHÍ GỢI Ý:
1. CATEGORY: Ưu tiên theo thứ tự sở thích ${allTopCategories.join(" > ")} 
2. TITLE: Ưu tiên tiêu đề tương tự với các bài đã xem
YÊU CẦU:
1. Phân tích và chấm điểm từng bài viết dựa trên 5 tiêu chí trên
2. Loại trừ hoàn toàn các bài viết người dùng đã xem
3. Nếu không đủ bài phù hợp, chọn thêm bài có views cao hoặc category phổ biến
4. Nếu như mà không có bài nào phù hợp, hãy trả về ít nhất 3 bài viết bất kỳ từ danh sách hiện có.
ĐỊNH DẠNG TRẢ VỀ:
Chỉ trả về mảng số thứ tự của các bài viết được gợi ý, ví dụ: [1, 2, 3, 4, 5]

Lưu ý: Kết hợp tất cả 5 tiêu chí để đưa ra gợi ý chính xác nhất cho sở thích của người dùng.
`;

  console.log("Prompt for Gemini:", prompt);
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
  let indexes: number[] = [];
  try {
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    indexes = JSON.parse(text.match(/\[.*\]/)?.[0] || "[]");
    indexes = indexes
      .map((i) => i - 1)
      .filter((i) => i >= 0 && i < blogs.length);
  } catch {
    indexes = [0, 1, 2];
  }

  const recommendations = indexes.map((i) => blogs[i]).filter(Boolean);
  console.log("Recommendations:", recommendations);

  return NextResponse.json({ recommendations });
}
