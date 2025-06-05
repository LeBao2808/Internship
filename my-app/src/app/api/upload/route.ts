import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "public", "uploads");

export async function POST(req: NextRequest) {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const formData = await req.formData();
  const file = formData.get("upload") as File; // 👈 CKEditor gửi field là "upload"

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileName = `${Date.now()}_${file.name.replace(/\s/g, "_")}`;
  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, buffer);

  const imageUrl = `/uploads/${fileName}`;
  return NextResponse.json({ url: imageUrl }, { status: 200 });
}

export async function GET() {
  const dir = path.join(process.cwd(), "public", "uploads");
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir);
  } catch (e) {
    return NextResponse.json({ images: [] });
  }
  const images = files.map(file => "/uploads/" + file);
  return NextResponse.json({ images });
}
