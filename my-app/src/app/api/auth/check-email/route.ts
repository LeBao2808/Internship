import { NextRequest, NextResponse } from "next/server";
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from "@/resources/lib/mongodb";
import User from "@/app/api/models/User"; // Thay bằng model của bạn

export async function POST (request: NextRequest) {

    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Missing email" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email }).lean();

    return NextResponse.json({ exists: !!existingUser }, { status: 200 });
}