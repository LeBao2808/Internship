import { NextResponse } from "next/server";
import dbConnect from "@/resources/lib/mongodb";
import User from "@/app/api/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Role, { IRole } from "../../models/Role";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

export async function POST(request: Request) {
  await dbConnect();
  const ADMIN_EMAIL = "admin123@gmail.com";
  const adminUser = await User.findOne({ email: ADMIN_EMAIL });
  console.log(adminUser);
if (!adminUser) {
  let adminRole = await Role.findOne({ name: "admin" });
  if (!adminRole) {
    adminRole = await Role.create({ name: "admin" });
    console.log("✅ Created default role: admin");
  }
  const hashed = await bcrypt.hash("bao123", 10);
  await User.create({
    name: "admin",
    email: ADMIN_EMAIL,
    password: hashed,
    role: adminRole._id,
  });
  console.log("✅ Created default admin user");
}
  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
  }
  const user = await User.findOne({ email }).populate("role");  
  if (!user) {
    return NextResponse.json({ error: "Email not found" }, { status: 400 });
  }
  if (!user.password) {
    return NextResponse.json({ error: "Account has not set password" }, { status: 400 });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return NextResponse.json({ error: "Password is incorrect" }, { status: 400 });
  }
  const payload = { userId: user._id, name: user.name, email: user.email, role: user.role, image_url: user.image };
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
  
  const roleName = (user.role as IRole).name;
  const response = NextResponse.json({ sessionToken: accessToken, user: { userId: user._id, name: user.name, email: user.email,
    role: roleName,
   image_url: user.image } });
  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15 // 15 minutes
  });

  response.cookies.set("next-auth.session-token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15 // 15 minutes
  });

  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 // 7 Day 
  });
console.log(response.cookies);
  return response;
}