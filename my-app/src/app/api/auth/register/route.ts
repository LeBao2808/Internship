import { NextResponse } from "next/server";
import dbConnect from "@/resources/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  await dbConnect();
  const { name, email, password } = await request.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Thiếu thông tin đăng ký" }, { status: 400 });
  }
  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "Email đã tồn tại" }, { status: 400 });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });
  return NextResponse.json({ userId: user._id, name: user.name, email: user.email });
}