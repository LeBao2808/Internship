import { NextRequest, NextResponse } from "next/server";
import Blog from "../../models/Blog";
import dbConnect from "@/resources/lib/mongodb";


export async function GET(
  req: NextRequest,
  params :  {
    params:Promise<{
      slug:string
    }>
  }
) {
  const slug = (await params.params).slug;
  await dbConnect();
  const blog = await Blog.findOne({ slug });
console.log(blog)
  if (!blog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(blog);
}