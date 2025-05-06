import { NextResponse } from "next/server";
import dbConnect from "@/resources/lib/mongodb";
import Role from "../../api/models/Role";

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            // { description: { $regex: search, $options: "i" } }
          ],
        }
      : {};

    const [roles, total] = await Promise.all([
      Role.find(query).skip(skip).limit(limit),
      Role.countDocuments(query),
    ]);

    return NextResponse.json({ roles, total, page, limit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  const body = await request.json();
  try {
    const newRole = await Role.create(body);
    return NextResponse.json({ roles: [newRole] }, { status: 201 });
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
    return NextResponse.json({ roles: [updatedRole] });
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