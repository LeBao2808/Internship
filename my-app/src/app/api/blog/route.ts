import { NextRequest, NextResponse } from "next/server";
import Blog from "../models/Blog";
import dbConnect from "@/resources/lib/mongodb";

// Thêm mới blog
export async function POST(req: NextRequest) {
  await dbConnect();
  const { title, content, user } = await req.json();
  try {
    const blog = await Blog.create({ title, content, user });
    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Không thể tạo blog" }, { status: 400 });
  }
}

// Sửa blog (cần truyền id trên query, ví dụ: /api/blog?id=xxx)
export async function PUT(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const { title, content } = await req.json();
  if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
  try {
    const blog = await Blog.findByIdAndUpdate(id, { title, content, createdUpdate: new Date() }, { new: true });
    if (!blog) return NextResponse.json({ error: "Không tìm thấy blog" }, { status: 404 });
    return NextResponse.json(blog);
  } catch (error) {
    return NextResponse.json({ error: "Không thể cập nhật blog" }, { status: 400 });
  }
}

// Xóa blog (cần truyền id trên query, ví dụ: /api/blog?id=xxx)
export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
  try {
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) return NextResponse.json({ error: "Không tìm thấy blog" }, { status: 404 });
    return NextResponse.json({ message: "Đã xóa blog thành công" });
  } catch (error) {
    return NextResponse.json({ error: "Không thể xóa blog" }, { status: 400 });
  }
}

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { content: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const [blogs, total] = await Promise.all([
      Blog.find(query).skip(skip).limit(limit),
      Blog.countDocuments(query)
    ]);

    return NextResponse.json({ blogs, total, page, limit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}