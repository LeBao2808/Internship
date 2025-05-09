import { NextRequest, NextResponse } from "next/server";
import Blog from "../../models/Blog";
import dbConnect from "@/resources/lib/mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;
  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json({ error: "Không tìm thấy blog" }, { status: 404 });
    }
    return NextResponse.json(blog);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}