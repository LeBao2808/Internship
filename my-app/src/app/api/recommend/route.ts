import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/resources/lib/auth.config";
import dbConnect from "@/resources/lib/mongodb";
import Blog from "../../api/models/Blog";
import User from "../models/User";
import ViewHistory from "../models/ViewHistory";

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ recommendations: [] });
  }

  const user = await User.findOne({ email: session.user.email });

  const histories = await ViewHistory.find({ user: user?._id })
    .populate({ path: "blog", populate: { path: "category", select: "name" } });

  const categoryCount: Record<string, number> = {};
  histories.forEach(h => {
    const catId = (h.blog as any)?.category?._id?.toString();
    if (catId) categoryCount[catId] = (categoryCount[catId] || 0) + 1;
  });

  // Sắp xếp category theo số lần xem giảm dần
  const sortedCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .map(([catId]) => catId);

  // Lấy blog thuộc các category user hay xem nhất, nếu không có thì lấy blog mới nhất
  let blogs: any[] = [];
  if (sortedCategories.length > 0) {
    blogs = await Blog.find({ category: { $in: sortedCategories } })
      .limit(10)
      .populate("category", "name");
  }
  if (blogs.length < 3) {
    const moreBlogs = await Blog.find()
      .limit(10 - blogs.length)
      .populate("category", "name");
    const blogIds = new Set(blogs.map(b => b._id.toString()));
    blogs = blogs.concat(moreBlogs.filter(b => !blogIds.has((b as any)._id.toString())));
  }

  // Tạo prompt cho Gemini
  const prompt = `
    Tôi là một hệ thống gợi ý blog. Dưới đây là danh sách các bài viết:
    ${blogs.map((b, i) => `${i + 1}. ${b.title} - ${b.category?.name || "Không có danh mục"}`).join("\n")}
    Hãy chọn ra 3 bài phù hợp nhất cho người dùng có email: ${user?.email} (dựa trên sở thích, lịch sử, ... nếu có).
    Trả về mảng các số thứ tự bài viết phù hợp nhất.
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
    indexes = indexes.map(i => i - 1).filter(i => i >= 0 && i < blogs.length);
  } catch {
    indexes = [0, 1, 2];
  }

  const recommendations = indexes.map((i) => blogs[i]).filter(Boolean);

  return NextResponse.json({ recommendations });
}
