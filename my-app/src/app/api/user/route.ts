import { NextResponse } from "next/server";
import dbConnect from "@/resources/lib/mongodb";
import User from "../../api/models/User";

export async function GET() {
  await dbConnect();
  const users = await User.find();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  await dbConnect();
  const body = await request.json();
  try {
    const newUser = await User.create(body);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  await dbConnect();
  const body = await request.json();
  try {
    const updatedUser = await User.findByIdAndUpdate(body.id, body, { new: true });
    if (!updatedUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  await dbConnect();
  const body = await request.json();
  try {
    await User.findByIdAndDelete(body.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}