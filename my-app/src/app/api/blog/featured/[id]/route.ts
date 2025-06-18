// app/api/blog/featured/[id]/route.ts
import { NextRequest } from "next/server";
import dbConnect from "@/resources/lib/mongodb";
import Blog from "../../../models/Blog";
import { promises } from "dns";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } ) {
  await dbConnect();
  const { id } = await params;
  const { featured } = await request.json();

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { featured },
      { new: true }
    );

    if (!updatedBlog) {
      return new Response(JSON.stringify({ error: "Blog not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(updatedBlog), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to update featured status" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}