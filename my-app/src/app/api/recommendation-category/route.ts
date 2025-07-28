import { NextRequest, NextResponse } from "next/server";
import RecomendationCategory from "../models/RecomendationCategory";
import dbConnect from "@/resources/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/resources/lib/auth.config";
import User from "../models/User";
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, categories } = await req.json();

    if (!userId || !categories || categories.length === 0) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    const userInDB = await User.findOne({
      email: session.user.email,
      name: session.user.name,
    });

    if (!userInDB) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    await RecomendationCategory.findOneAndUpdate(
      { user: userInDB.id },
      { categories },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: "Categories saved successfully" });
  } catch (error) {
    console.error("Error saving recommendation categories:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userInDB = await User.findOne({
      email: session.user.email,
      name: session.user.name,
    });
    if (!userInDB) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }
    const recommendation = await RecomendationCategory.findOne({
      user: userInDB.id,
    }).populate("categories");

    return NextResponse.json({ recommendation });
  } catch (error) {
    console.error("Error fetching recommendation categories:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { userId, categories } = await req.json();

    if (!userId || !categories) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const updated = await RecomendationCategory.findOneAndUpdate(
      { user: userId },
      { categories },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Recommendation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Categories updated successfully" });
  } catch (error) {
    console.error("Error updating recommendation categories:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "User ID required" },
        { status: 400 }
      );
    }

    await RecomendationCategory.findOneAndDelete({ user: userId });

    return NextResponse.json({
      message: "Recommendation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting recommendation categories:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
