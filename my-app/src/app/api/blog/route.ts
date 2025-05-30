import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/resources/lib/mongodb";
import Blog from "../../api/models/Blog";
import slugify from "slugify";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;
  const category = searchParams.get("category");
  const sortParam = searchParams.get("sort") || ""; // Thêm dòng này

  let query: any = {};
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } }
    ];
  }
  if (category) {
    query.category = category;
  }

  // Xử lý sort
  let sort: any = {};
  if (sortParam) {
    const [field, direction] = sortParam.split(":");
    sort[field] = direction === "desc" ? -1 : 1;
  } else {
    sort = { createdAt: -1 }; // Mặc định sort theo createdAt mới nhất
  }

  try {
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort) // Thêm sort vào đây
        .populate("category", "name"),
      Blog.countDocuments(query)
    ]);
    return NextResponse.json({ blogs, total, page, limit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
// Thêm mới blog
export async function POST(req: NextRequest) {
  await dbConnect();
const body = await req.json();
  try {
    const newBlog = await Blog.create({...body,slug:slugify(body.title), createdAt: new Date(), updatedAt: new Date() });
    return NextResponse.json(newBlog, { status: 201 }); // Trả về một phản hồi thành công với status 201 và dữ liệu của blog mới
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Sửa blog (cần truyền id trên query, ví dụ: /api/blog?id=xxx)
export async function PUT(request: Request) {
  await dbConnect();
  const body = await request.json();
  console.log(body);
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      body.id,
      { ...body, updatedAt: new Date() },
      { new: true }
    );
    if (!updatedBlog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    return NextResponse.json(updatedBlog);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}


// Xóa blog (cần truyền id trên query, ví dụ: /api/blog?id=xxx)
export async function DELETE(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  try {
    await Blog.findByIdAndDelete(body.id);
    return NextResponse.json({ message: "Blog deleted" }, { status: 200 }); // Trả về một phản hồi thành công với status 200 và thông điệp thành công
  }catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}