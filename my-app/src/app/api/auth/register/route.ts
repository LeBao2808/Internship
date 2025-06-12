import { NextResponse } from "next/server";
import dbConnect from "@/resources/lib/mongodb";
import User from "../../models/User";
import bcrypt from "bcryptjs";
import Role from "../../models/Role";

export async function POST(request: Request) {
  await dbConnect();
  const { name, email, password, image } = await request.json();
  if (!name || !email ) {
    return NextResponse.json({ error: "Missing information register" }, { status: 400 });
  }
  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 });
  }

  const defaultRole = await Role.findOne({ name: "user" }); 

if (!defaultRole) {
  throw new Error("Default role 'user' not found in Role collection");
}
let hashedPassword;

// Chỉ hash password nếu có giá trị (trường hợp đăng ký thủ công)
if (password) {
  hashedPassword = await bcrypt.hash(password, 10);
}
  const user = await User.create({ name, email, password: hashedPassword ?? undefined,  role: defaultRole._id, image: image?? undefined  });
  console.log("user", user);
  return NextResponse.json({ userId: user._id, name: user.name, email: user.email });
}