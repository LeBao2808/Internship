import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/resources/lib/mongodb";
import Role from "../../api/models/Role";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || ""; // Lấy tham số sort
  let query: any = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  // Xử lý sort
  let sort: any = {};
  if (sortParam) {
    const [field, direction] = sortParam.split(":");
    sort[field] = direction === "desc" ? -1 : 1;
  } else {
    sort = { name: 1 }; // Mặc định sort theo tên tăng dần
  }

  try {
    const roles = await Role.find(query).sort(sort);
    return NextResponse.json({ roles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  const body = await request.json();
  try {
    const newRole = await Role.create({ ...body, createdAt: new Date() });
    return NextResponse.json({ roles: [newRole] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  await dbConnect();
  const body = await request.json();
  try {
    const updatedRole = await Role.findByIdAndUpdate(
      body.id,
      { ...body, updatedAt: new Date() },
      { new: true }
    );
    if (!updatedRole) return NextResponse.json({ error: "Role not found" }, { status: 404 });
    return NextResponse.json({ roles: [updatedRole] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  await dbConnect();
  const body = await request.json();
  try {
    await Role.findByIdAndUpdate(body.id, {...body,createdDelete: new Date(), isDelete: new Date() }, { new: true });
    await Role.findByIdAndDelete(body.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}