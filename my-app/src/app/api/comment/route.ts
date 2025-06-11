import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/resources/lib/mongodb";
import Comment from "@/app/api/models/Comment";
import User from "@/app/api/models/User"; // nếu cần `populate`
import { z } from "zod";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";

require('../../api/models/User');

require('../../api/models/Blog');
// Define Comment validation schema
const CommentSchema = z.object({
  content: z.string().min(1, "Content is required"),
  user: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID"),
});

import Blog from "@/app/api/models/Blog";
import { NextApiRequest, NextApiResponse } from "next";

export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const sortParam = searchParams.get("sort") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const query: any = {};

    if (search) {
      // Tìm các blog có title khớp
   const matchingBlogs = await Blog.find({
  $or: [
    { title: { $regex: search, $options: "i" } },
    { slug: { $regex: search, $options: "i" } },
  ],
}).select("_id");

      const blogIds = matchingBlogs.map((b) => b._id);

      query.$or = [
        { content: { $regex: search, $options: "i" } },
        { blog: { $in: blogIds } },
      ];
    }

    let sort: any = {};
    if (sortParam) {
      const [field, direction] = sortParam.split(":");
      sort[field] = direction === "desc" ? -1 : 1;
    } else {
      sort = { createdAt: -1 };
    }

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .populate("user", "name email")
        .populate("blog", "title"),
      Comment.countDocuments(query),
    ]);

    return NextResponse.json({ comments, total, page, limit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { content, slug } = await request.json();

    if (!content || !slug) {
      return new Response(JSON.stringify({ error: "Thiếu dữ liệu" }), {
        status: 400,
      });
    }

    const decodedSlug = decodeURIComponent(slug);
    const blog = await Blog.findOne({ slug: decodedSlug });

    if (!blog) {
      return new Response(
        JSON.stringify({ error: "Không tìm thấy bài viết" }),
        {
          status: 404,
        }
      );
    }

    const newComment = await Comment.create({
      content,
      user: session.user.id,
      blog: blog._id,
    });



    return new Response(
      JSON.stringify({ success: true, comment: newComment }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Lỗi tạo bình luận:", error);
    return new Response(
      JSON.stringify({ error: "Lỗi máy chủ nội bộ" }),
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  await dbConnect();
  const body = await request.json();
  const parsed = CommentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format() },
      { status: 400 }
    );
  }

  try {
    const updatedComment = await Comment.findByIdAndUpdate(body.id, body, {
      new: true,
    });
    if (!updatedComment)
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    return NextResponse.json(updatedComment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  await dbConnect();
  const body = await request.json();

  try {
    await Comment.findByIdAndDelete(body.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
