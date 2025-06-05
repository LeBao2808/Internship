import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/resources/lib/mongodb";
import User from "../../api/models/User";
import Role from "../../api/models/Role";
import { z } from 'zod';
import Email from "next-auth/providers/email";
const UserSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters long')
    .regex(/^[\p{L}0-9\s]+$/u, 'Name must not contain special characters'),

  email: z.string()
    .max(200, 'Email must be at most 200 characters long')
    .email('Invalid email format')
    .refine(val => val.endsWith('@gmail.com'), {
      message: 'Only @gmail.com email addresses are accepted',
    })
    .optional(),
});
require('../../api/models/Role');
 
export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const sortParam = searchParams.get("sort") || ""; 
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

      let sort: any = {};
      if (sortParam) {
        const [field, direction] = sortParam.split(":");
        sort[field] = direction === "desc" ? -1 : 1;
      } else {
        sort = { name: 1 }; 
      }

    const [users, total] = await Promise.all([
      User.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .populate("role", "name"), 
      User.countDocuments(query),
    ]);
  console.log(users);
    return NextResponse.json({ users, total, page, limit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  const body = await request.json();
  const parsed = UserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format() },
      { status: 400 }
    );
  }
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
  console.log(body);
  const parsed = UserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format() },
      { status: 400 }
    );
  }
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
    User.findByIdAndUpdate(body.id, {...body, deletedAt: new Date(), isDeleted: true});
    await User.findByIdAndDelete(body.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}