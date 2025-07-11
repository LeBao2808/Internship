import Category from "@/app/api/models/Category";
import Blog from "@/app/api/models/Blog";
import dbConnect from "@/resources/lib/mongodb";
import { NextRequest } from "next/server";
import ViewHistory from "../models/ViewHistory";
import User from "../models/User";

export async function GET(request: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user");

  const categories = await Category.find({});
  const totalPosts = await Blog.countDocuments();

  if (userId) {
    // Lấy thông tin người dùng từ userId
    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ error: "User not found" });
    }

    // Lấy lịch sử đọc và populate category của blog
    const histories = await ViewHistory.find({ user: user._id }).populate({
      path: "blog",
      select: "category",
    });

    // Đếm số bài đã đọc theo category
    const readCount: Record<string, number> = {};
    histories.forEach((h: any) => {
      const catId = h.blog?.category?.toString();
      if (catId) readCount[catId] = (readCount[catId] || 0) + 1;
    });

    // Đếm tổng số bài viết theo category
    const totalCount: Record<string, number> = {};
    const blogs = await Blog.find().select("category");
    blogs.forEach((b: any) => {
      const catId = b.category?.toString();
      if (catId) totalCount[catId] = (totalCount[catId] || 0) + 1;
    });

    // Tính % đã đọc cho từng category
    const stats = categories.map((cat: any) => {
      const total = totalCount[cat._id.toString()] || 0;
      const read = readCount[cat._id.toString()] || 0;
      return {
        name: cat.name,
        postCount: read,
        percent: total > 0 ? Math.round((read / total) * 100) : 0,
      };
    });

    return Response.json({ stats });
  } else {
    // Trường hợp không có userId: chỉ đếm số bài viết theo category như trước
    const stats = await Promise.all(
      categories.map(async (cat) => {
        const count = await Blog.countDocuments({ category: cat._id });
        return {
          name: cat.name,
          postCount: count,
          percent: totalPosts ? Math.round((count / totalPosts) * 100) : 0,
        };
      })
    );
    return Response.json({ stats });
  }
}
