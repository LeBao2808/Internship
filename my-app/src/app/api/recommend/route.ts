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

    console.log("User's view histories:", histories);
const blogHistorys = histories.map(h => ({
  name: (h.blog as any)?.title?.toString() || null,
  category: (h.blog as any)?.category?.name?.toString() || null
}));

console.log("Blog histories:", blogHistorys);
  const categoryCount: Record<string, number> = {};
  histories.forEach(h => {
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
    const blogIds = new Set(blogs.map(b => b._id.toString()));
    blogs = blogs.concat(moreBlogs.filter(b => !blogIds.has((b as any)._id.toString())));
  }

  console.log("Blogs fetched:", blogs.length);
  // Lấy tất cả categories theo thứ tự giảm dần
  const allTopCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .map(([catId]) => {
      const categoryName = histories.find(h => (h.blog as any)?.category?._id?.toString() === catId);
      return `${(categoryName?.blog as any)?.category?.name || "Không xác định"} `;
    });

const prompt = `
Bạn là hệ thống gợi ý blog thông minh. Nhiệm vụ của bạn là phân tích hành vi đọc của người dùng và đề xuất các bài viết phù hợp nhất.

THÔNG TIN NGƯỜI DÙNG:
- Email: ${user?.email}
- Lịch sử xem: Đã xem ${blogHistorys.map(h => `"${h.name}" - Category: ${h.category || "Không phân loại"}`).join(", ") || "Không có lịch sử xem"}
- Categories yêu thích theo thứ tự giảm dần: ${allTopCategories.join(", ")}

DANH SÁCH BÀI VIẾT HIỆN CÓ:
${blogs.map((b, i) => `${i + 1}. "${b.title}" - Category: ${b.category?.name || "Không phân loại"}`).join("\n")}

YÊU CẦU:
1. Ưu tiên GỢI Ý các bài viết theo thứ tự sở thích: ${allTopCategories.join(" > ")} (ưu tiên các bài viết chưa xem)
2. Nếu không đủ bài trong category yêu thích, hãy chọn thêm các bài từ category tương tự hoặc phổ biến
3. Loại trừ các bài viết người dùng đã xem (nếu có thông tin)
4. Chọn tối đa 5-8 bài viết phù hợp nhất
5. Ví Dụ :
tôi có 1 danh sách blog như sau : 
Bài viết A - Category: HTML/CSS
Bài viết B - Category: HTML/CSS
Bài viết C - Category: Next.js
Bài viết D - Category: HTML/CSS
Bài viết E - Category: Next.js
Bài viết F - Category: C++
Bài viết G - Category: HTML/CSS
Bài viết H - Category: C++
ví dụ category tôi hay xem nhiêu nhất là html/css mà trong danh sách trên tôi đã xem 2 bài viết D và G
tôi cũng đã đọc bài Bài viết C - Category: Next.js
thể loại tôi hay xem sau HTML/CSS là Next.js và C++
thì bây giờ kết quả trả ra tôi mươn theo thứ tự 
Bài viết A - Category: HTML/CSS
Bài viết B - Category: HTML/CSS
Bài viết E - Category: Next.js
Bài viết F - Category: C++
Bài viết H - Category: C++
6. Nếu như mà không có bài nào phù hợp, hãy trả về ít nhất 3 bài viết bất kỳ từ danh sách hiện có.
ĐỊNH DẠNG TRẢ VỀ:
Chỉ trả về mảng số thứ tự của các bài viết được gợi ý, ví dụ: [1, 3, 5, 7, 9]

Lưu ý: Tập trung vào sở thích đọc đã được thể hiện qua lịch sử xem của người dùng.
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
  console.log("Recommendations:", recommendations);

  return NextResponse.json({ recommendations });
}
