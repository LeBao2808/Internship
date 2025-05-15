import { NextRequest, NextResponse } from "next/server";
import Blog from "../../models/Blog";
import dbConnect from "@/resources/lib/mongodb";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  await dbConnect();

  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json({ error: 'Không tìm thấy blog' }, { status: 404 });
    }
    return NextResponse.json(blog);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}