import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/resources/lib/auth.config";
import dbConnect from "@/resources/lib/mongodb";
import Blog from "../models/Blog";
import Category from "../models/Category";
import User from "../models/User";
import ViewHistory from "../models/ViewHistory";
require('../../api/models/Blog');
require('../../api/models/Category');
require('../../api/models/User');
require('../../api/models/ViewHistory');
export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ progress: [] });
  }

  const user = await User.findOne({ email: session.user.email });
  const categories = await Category.find();
  const blogs = await Blog.find();
  const histories = await ViewHistory.find({ user: user?._id }).populate({
    path: "blog",
    select: "category",
  });

  // Đếm số bài đã đọc theo category
  const readCount: Record<string, number> = {};
  histories.forEach((h: any) => {
    const catId = h.blog?.category?.toString();
    if (catId) readCount[catId] = (readCount[catId] || 0) + 1;
  });

  // Đếm tổng số bài theo category
  const totalCount: Record<string, number> = {};
  blogs.forEach((b: any) => {
    const catId = b.category?.toString();
    if (catId) totalCount[catId] = (totalCount[catId] || 0) + 1;
  });

  // Tính % đã đọc cho từng category
  const progress = categories.map((cat: any) => {
    const total = totalCount[cat._id.toString()] || 0;
    const read = readCount[cat._id.toString()] || 0;
    return {
      _id: cat._id,
      name: cat.name,
      percent: total > 0 ? Math.round((read / total) * 100) : 0,
      read,
      total,
    };
  });

  return NextResponse.json({ progress });
}