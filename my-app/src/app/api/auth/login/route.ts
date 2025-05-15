import { NextResponse } from "next/server";
import dbConnect from "@/resources/lib/mongodb";
import User from "@/app/api/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

export async function POST(request: Request) {
  await dbConnect();
  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Thiếu email hoặc mật khẩu" }, { status: 400 });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "Email không tồn tại" }, { status: 400 });
  }
  if (!user.password) {
    return NextResponse.json({ error: "Tài khoản chưa thiết lập mật khẩu" }, { status: 400 });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return NextResponse.json({ error: "Mật khẩu không đúng" }, { status: 400 });
  }
  // Tạo access token và refresh token
  const payload = { userId: user._id, name: user.name, email: user.email };
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
  // Lưu refresh token vào database (nếu muốn quản lý đăng xuất hoặc thu hồi token)
  // user.refreshToken = refreshToken;
  await user.save();
  // Thiết lập cookie chứa accessToken
  const response = NextResponse.json({ accessToken, refreshToken, user: { userId: user._id, name: user.name, email: user.email } });
  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15 // 15 phút
  });
  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 // 7 ngày
  });
  return response;
}