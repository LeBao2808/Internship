import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Blog from "../../models/Blog";
import dbConnect from "@/resources/lib/mongodb";

const uploadDir = path.join(process.cwd(), "public", "uploads");

export async function POST(req: NextRequest) {
  await dbConnect(); // <-- Add this line
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const formData = await req.formData();
  const file = formData.get("image") as File;
  const blogId = formData.get("id") as string;
console.log(blogId);
console.log(file);
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (!blogId) {
    return NextResponse.json({ error: "No blog id provided" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileName = Date.now() + "_" + file.name;
  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, buffer);

  const imageUrl = "/uploads/" + fileName;

  try {
    await Blog.findByIdAndUpdate(blogId, { image_url: imageUrl });
  } catch (e) {
    return NextResponse.json({ error: "Update blog failed" }, { status: 500 });
  }

  return NextResponse.json({ image_url: imageUrl }, { status: 200 });
}




export async function GET() {
  const dir = path.join(process.cwd(), "public", "uploads");
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir);
  } catch (e) {
    return NextResponse.json({ images: [] });
  }
  // Trả về đường dẫn public cho từng ảnh
  const images = files.map(file => "/uploads/" + file);
  return NextResponse.json({ images });
}