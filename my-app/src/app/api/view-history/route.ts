import { NextResponse } from "next/server";
import dbConnect from "@/resources/lib/mongodb";
import ViewHistory from "../models/ViewHistory";

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const { user, blog } = body;
  if (!user || !blog) return NextResponse.json({ error: "Missing user or blog" }, { status: 400 });

  const history = await ViewHistory.create({ user, blog });
  return NextResponse.json(history);
}

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user");
  const blog = searchParams.get("blog");

  const filter: any = {};
  if (user) filter.user = user;
  if (blog) filter.blog = blog;

  const histories = await ViewHistory.find(filter).populate("user").populate({ path: "blog", populate: { path: "category", select: "name" } }).sort({ viewedAt: -1 });
  return NextResponse.json(histories);
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