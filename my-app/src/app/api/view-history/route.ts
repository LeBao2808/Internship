import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/resources/lib/auth.config";
import dbConnect from "@/resources/lib/mongodb";
import ViewHistory from "../models/ViewHistory";
import User from "../models/User";
require('../../api/models/ViewHistory');

export async function POST(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const body = await req.json();
  
  // Check view status for multiple blogs
  if (body.blogIds) {
    if (!session?.user?.email) {
      return NextResponse.json({ viewed: [] });
    }
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ viewed: [] });
    }
    
    const viewedBlogs = await ViewHistory.find({
      user: user._id,
      blog: { $in: body.blogIds }
    }).select('blog');
    
    const viewedBlogIds = viewedBlogs.map(v => v.blog.toString());
    return NextResponse.json({ viewed: viewedBlogIds });
  }
  
  // Create view history
  const { user, blog } = body;
  if (!user || !blog) return NextResponse.json({ error: "Missing user or blog" }, { status: 400 });

  const history = await ViewHistory.create({ user, blog });
  return NextResponse.json(history);
}

export async function GET(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user");
  const blog = searchParams.get("blog");

  const filter: any = {};
  if (user) filter.user = user;
  if (blog) filter.blog = blog;

  const histories = await ViewHistory.find(filter).populate("user").populate({ path: "blog", populate: { path: "category", select: "name" } }).sort({ viewedAt: -1 });
  
  // Add isViewed field for current user
  let currentUser = null;
  if (session?.user?.email) {
    currentUser = await User.findOne({ email: session.user.email });
  }
  
  const historiesWithViewStatus = await Promise.all(
    histories.map(async (history) => {
      let isViewed = false;
      if (currentUser && history.blog) {
        const viewRecord = await ViewHistory.findOne({
          user: currentUser._id,
          blog: history.blog
        });
        isViewed = !!viewRecord;
      }
      return {
        ...history.toObject(),
        isViewed
      };
    })
  );
  
  return NextResponse.json(historiesWithViewStatus);
}

export async function PUT(req: Request) {
  await dbConnect();
  const body = await req.json();
  const { id, viewedAt } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const updated = await ViewHistory.findByIdAndUpdate(id, { viewedAt }, { new: true });
  return NextResponse.json(updated);
}


export async function DELETE(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await ViewHistory.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}