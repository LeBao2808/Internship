import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Blog from "../../models/Blog";
import dbConnect from "@/resources/lib/mongodb";
import cloudinary from "@/resources/lib/cloudinary"

const uploadDir = path.join(process.cwd(), "public", "uploads");

// export async function POST(req: NextRequest) {
//   await dbConnect(); // <-- Add this line
//   if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
//   }
//   const formData = await req.formData();
//   const file = formData.get("image") as File;
//   const blogId = formData.get("id") as string;
// console.log(blogId);
// console.log(file);
//   if (!file) {
//     return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//   }
//   if (!blogId) {
//     return NextResponse.json({ error: "No blog id provided" }, { status: 400 });
//   }

//   const arrayBuffer = await file.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);
//   const fileName = Date.now() + "_" + file.name;
//   const filePath = path.join(uploadDir, fileName);
//   fs.writeFileSync(filePath, buffer);

//   const imageUrl = "/uploads/" + fileName;

//   try {
//     await Blog.findByIdAndUpdate(blogId, { image_url: imageUrl });
//   } catch (e) {
//     return NextResponse.json({ error: "Update blog failed" }, { status: 500 });
//   }

//   return NextResponse.json({ image_url: imageUrl }, { status: 200 });
// }

export async function POST(req: NextRequest) {
  await dbConnect();

  const formData = await req.formData();
  const file = formData.get("image") as File;
  const blogId = formData.get("id") as string;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (!blogId) {
    return NextResponse.json({ error: "No blog id provided" }, { status: 400 });
  }

  try {
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload lên Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "blogs", // thư mục trên Cloudinary
          use_filename: true,
          unique_filename: false,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const imageUrl = (result as any).secure_url;

    // Cập nhật vào DB
    await Blog.findByIdAndUpdate(blogId, { image_url: imageUrl });

    return NextResponse.json({ image_url: imageUrl }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload or update failed" }, { status: 500 });
  }
}


export async function GET() {
  const dir = path.join(process.cwd(), "public", "uploads");
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir);
  } catch (e) {
    return NextResponse.json({ images: [] });
  }
  // Returns the public link for each image
  const images = files.map(file => "/uploads/" + file);
  return NextResponse.json({ images });
}