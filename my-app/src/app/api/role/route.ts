import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/resources/lib/mongodb";
import Role from "../../api/models/Role";
import { z } from 'zod';



const RoleSchema = z.object({
  name: z.string().min(3, 'name limit 3 characters')
  .regex(/^[\p{L}0-9\s]+$/u, 'Name must not contain special characters'),
  description: z.string().max(200).optional(),
});

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  try {
  const search = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || ""; 
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);      
  const skip = (page - 1) * limit;
  const query: any = {};
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
    sort = { name: 1 }; 
  }
  const [roles, total] = await Promise.all([
    Role.find(query).skip(skip).limit(limit).sort(sort),
    Role.countDocuments(query),
  ]);
  console.log(roles);

  return NextResponse.json({roles, total, page, limit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  const body = await request.json();
  console.log(body);
  const parsed = RoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format() },
      { status: 400 }
    );
  }


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
  console.log(body);
  const parsed = RoleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format() },
      { status: 400 }
    );
  }
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
  console.log(body);
  try {
    // await Role.findByIdAndUpdate(body.id, {...body,createdDelete: new Date(), isDelete: new Date() }, { new: true });
    await Role.findByIdAndDelete(body.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}