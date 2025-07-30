import Blog from "../../models/Blog";
import dbConnect from "@/resources/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    
    const topBlogs = await Blog.find()
      .sort({ view: -1 })
      .limit(3)
      .populate("user", "name")
      .populate("category", "name");
    return NextResponse.json({ success: true, data: topBlogs });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch top blogs' }, { status: 500 });
  }
}