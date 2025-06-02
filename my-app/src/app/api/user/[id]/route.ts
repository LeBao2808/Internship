import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/resources/lib/mongodb";
import User from "../../../api/models/User";

export async function GET(req: NextRequest,    params :  {
  params:Promise<{
    id:string
  }>
}) {
  const id = (await params.params).id;
  await dbConnect();
  
  try {
    const user = await User.findById(id).select("name email");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}