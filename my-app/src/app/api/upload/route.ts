import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import cloudinary from "@/resources/lib/cloudinary";
const uploadDir = path.join(process.cwd(), "public", "uploads");

// export async function POST(req: NextRequest) {
//   if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
//   }

//   const formData = await req.formData();
//   const file = formData.get("upload") as File; // 👈 CKEditor gửi field là "upload"

//   if (!file) {
//     return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//   }

//   const arrayBuffer = await file.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);
//   const fileName = `${Date.now()}_${file.name.replace(/\s/g, "_")}`;
//   const filePath = path.join(uploadDir, fileName);
//   fs.writeFileSync(filePath, buffer);

//   const imageUrl = `/uploads/${fileName}`;
//   return NextResponse.json({ url: imageUrl }, { status: 200 });
// }

// export async function GET() {
//   const dir = path.join(process.cwd(), "public", "uploads");
//   let files: string[] = [];
//   try {
//     files = fs.readdirSync(dir);
//   } catch (e) {
//     return NextResponse.json({ images: [] });
//   }
//   const images = files.map(file => "/uploads/" + file);
//   return NextResponse.json({ images });
// }

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("upload") as File; // CKEditor gửi field là "upload"

  if (!file || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  try {
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload lên Cloudinary
    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "ckeditor_uploads", // Thư mục trên Cloudinary
          use_filename: false, 
          unique_filename: true, 
          overwrite: false, 
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const imageUrl = result.secure_url;
    console.log("imageURL", imageUrl);

    // Trả về đúng format CKEditor mong muốn
    return NextResponse.json({ image_url: imageUrl });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
