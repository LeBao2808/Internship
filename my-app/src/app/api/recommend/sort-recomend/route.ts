import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/resources/lib/auth.config";
import dbConnect from "@/resources/lib/mongodb";
import Blog from "../../models/Blog";
import User from "../../models/User";
import ViewHistory from "../../models/ViewHistory";
require("../../models/Blog");
require("../../models/User");
require("../../models/Role");
require("../../models/ViewHistory");
require("../../models/Category"); 

export async function GET(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ blogs: [], total: 0, page: 1, limit: 10 });
  }

  // Lấy query params cho phân trang
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  const user = await User.findOne({ email: session.user.email });

  // Lấy lịch sử xem của user
  const histories = await ViewHistory.find({ user: user?._id })
    .populate({ path: "blog", populate: { path: "category", select: "name" } });

  const categoryCount: Record<string, number> = {};
  histories.forEach(h => {
    const catId = (h.blog as any)?.category?._id?.toString();
    if (catId) categoryCount[catId] = (categoryCount[catId] || 0) + 1;
  });

  const sortedCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .map(([catId]) => catId);

  // Lấy toàn bộ blog (có populate category)
  const allBlogs = await Blog.find()
    .populate("category", "name")
    .populate("user", "name");

  // Tạo map ưu tiên cho category
  const categoryPriority: Record<string, number> = {};
  sortedCategories.forEach((catId, idx) => {
    categoryPriority[catId] = idx;
  });

  // Sort blogs: category càng ưu tiên càng lên đầu, chưa từng xem thì xuống cuối
  const sortedBlogs = allBlogs.sort((a: any, b: any) => {
    const aCat = a.category?._id?.toString();
    const bCat = b.category?._id?.toString();
    const aPriority = categoryPriority.hasOwnProperty(aCat) ? categoryPriority[aCat] : 9999;
    const bPriority = categoryPriority.hasOwnProperty(bCat) ? categoryPriority[bCat] : 9999;
    return aPriority - bPriority;
  });

  // Phân trang
  const pagedBlogs = sortedBlogs.slice(skip, skip + limit);

  return NextResponse.json({
    blogs: pagedBlogs,
    total: sortedBlogs.length,
    page,
    limit,
  });
}