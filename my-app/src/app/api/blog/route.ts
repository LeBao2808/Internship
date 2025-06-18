import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/resources/lib/mongodb";
import Blog from "../../api/models/Blog";
import User from "../models/User";
import { z } from 'zod';
import { getServerSession } from "next-auth";
import { authOptions } from "@/resources/lib/auth.config"; 
import mongoose from "mongoose";
import generateSlug from "@/utils/generateSlug";

const BlogSchema = z.object({
  title: z.string().trim().min(5)
  .optional(),
});
require('../../api/models/Category');
require('../../api/models/User');
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "0", 10);
  const skip = (page - 1) * limit;
  const category = searchParams.get("category");
  const sortParam = searchParams.get("sort") || ""; 

 
  const query: any = {};
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } }
    ];
  }
     const dbUser = await User.findOne({ email: session?.user?.email  }).exec();
    if (dbUser &&  session?.user?.role != "admin" ) {
      query.user = dbUser.id;
    }
  if (category) {
    query.category = category;
  }

  // Handle sort
  let sort: any = {};
  if (sortParam) {
    const [field, direction] = sortParam.split(":");
    sort[field] = direction === "desc" ? -1 : 1;
  } else {
    sort = { createdAt: -1 }; // Default sort by latest createdAt
  }

  try {
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort) 
        .populate("category", "name")
        .populate("user", "name" ),
      Blog.countDocuments(query)
    ]);
    return NextResponse.json({ blogs, total, page, limit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = BlogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Title or content not entered or too short." },
      { status: 400 }
    );
  }

  try {
    const dbUser = await User.findOne({ email: session.user.email }).exec();

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const slug = generateSlug(body.title)
    const newBlog = await Blog.create({
      ...body,
      slug,
      user: dbUser._id, 
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(newBlog, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}


export async function PUT(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = BlogSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format() },
      { status: 400 }
    );
  }

  try {
    const dbUser = await User.findOne({ email: session.user.email }).exec();
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const slug = generateSlug(body.title);

    const updatedBlog = await Blog.findByIdAndUpdate(
      body.id,
      {
        ...body,
        user: dbUser._id, 
        updatedAt: new Date(),
        slug,
      },
      { new: true }
    );

    if (!updatedBlog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(updatedBlog);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}



export async function DELETE(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  console.log(body);
  try {
    // await Blog.findByIdAndUpdate(body.id,{...body ,deletedAt: new Date(), isDeleted:true});
    await Blog.findByIdAndDelete(body.id);
    return NextResponse.json({ message: "Blog deleted" }, { status: 200 }); 
  }catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

