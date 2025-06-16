import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import User from "../../models/User";
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
//   const userId = formData.get("id") as string;
// console.log(userId);
// console.log(file);
//   if (!file) {
//     return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//   }
//   if (!userId) {
//     return NextResponse.json({ error: "No user id provided" }, { status: 400 });
//   }

//   const arrayBuffer = await file.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);
//   const fileName = Date.now() + "_" + file.name;
//   const filePath = path.join(uploadDir, fileName);
//   fs.writeFileSync(filePath, buffer);

//   const imageUrl = "/uploads/" + fileName;

//   try {
//     await User.findByIdAndUpdate(userId, { image: imageUrl });
//   } catch (e) {
//     return NextResponse.json({ error: "Update user failed" }, { status: 500 });
//   }

//   return NextResponse.json({ image: imageUrl }, { status: 200 });
// }

export async function POST(req: NextRequest) {
  await dbConnect();

  const formData = await req.formData();
  const file = formData.get("image") as File;
  const userId = formData.get("id") as string;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (!userId) {
    return NextResponse.json({ error: "No user id provided" }, { status: 400 });
  }

  try {
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload lên Cloudinary
    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "users", // Thư mục trên Cloudinary
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

    const imageUrl = result.secure_url;

    // Cập nhật avatar vào DB
    await User.findByIdAndUpdate(userId, { image: imageUrl });

    return NextResponse.json({ image: imageUrl }, { status: 200 });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Upload or update failed" }, { status: 500 });
  }
}