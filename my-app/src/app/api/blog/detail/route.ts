import { NextRequest, NextResponse } from "next/server";
import Blog from "../../models/Blog";
import dbConnect from "@/resources/lib/mongodb";

export async function GET(
  request: NextRequest,
  // context: { params: { id: string } }
) {
  const body = await request.json();
  const { id } = body;

  await dbConnect();

  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    return NextResponse.json(blog);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}