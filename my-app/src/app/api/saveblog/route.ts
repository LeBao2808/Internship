import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/resources/lib/auth.config";
import dbConnect from "@/resources/lib/mongodb";
import SaveBlog from "../models/SaveBlog";
import User from "../models/User";

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await User.findOne({ email: session.user.email });
    const savedBlogs = await SaveBlog.find({ user: user?._id })
      .populate({
        path: "blog",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .populate("user", "name email");

    return NextResponse.json({ savedBlogs }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const user = await User.findOne({ email: session.user.email });

    const existingSave = await SaveBlog.findOne({
      blog: body.blogId,
      user: user?._id,
    });

    if (existingSave) {
      return NextResponse.json(
        { error: "Blog already saved" },
        { status: 400 }
      );
    }

    const saveBlog = new SaveBlog({
      blog: body.blogId,
      user: user?._id,
    });

    await saveBlog.save();
    return NextResponse.json(
      { message: "Blog saved", saveBlog },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const user = await User.findOne({ email: session.user.email });

    const result = await SaveBlog.findOneAndDelete({
      blog: body.blogId,
      user: user?._id,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Saved blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Blog unsaved" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
