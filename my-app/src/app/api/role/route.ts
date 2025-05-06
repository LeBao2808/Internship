import { NextResponse } from "next/server";
import dbConnect from "@/resources/lib/mongodb";
import Role from "../../api/models/Role";

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { search } = Object.fromEntries(new URL(request.url).searchParams);
    let query = {};
    if (search) {
      // Tìm kiếm theo tên hoặc các trường khác nếu cần
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          // Thêm các trường khác nếu cần, ví dụ:
          // { description: { $regex: search, $options: "i" } }
        ]
      };
    }
    const Roles = await Role.find(query);
    return NextResponse.json(Roles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  const body = await request.json();
  try {
    const newRole = await Role.create(body);
    return NextResponse.json(newRole, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  await dbConnect();
  const body = await request.json();
  try {
    const updatedRole = await Role.findByIdAndUpdate(body.id, body, { new: true });
    if (!updatedRole) return NextResponse.json({ error: "Role not found" }, { status: 404 });
    return NextResponse.json(updatedRole);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  await dbConnect();
  const body = await request.json();
  try {
    await Role.findByIdAndDelete(body.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}