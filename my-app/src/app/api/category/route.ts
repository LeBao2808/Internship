import {  NextResponse } from "next/server";
import dbConnect from "@/resources/lib/mongodb";
import Category from "../models/Category";

export async function GET(request: Request) {
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
              // { description: { $regex: search, $options: "i" } }
            ],
          }
        : {};
  

        let sort: any = {};
        if (sortParam) {
          const [field, direction] = sortParam.split(":");
          sort[field] = direction === "desc" ? -1 : 1;
        } else {
          sort = { name: 1 }; // Mặc định sort theo tên tăng dần
        }

      const [categories, total] = await Promise.all([
        Category.find(query).skip(skip).limit(limit).sort(sort),
        Category.countDocuments(query),
      ]);
  
      return NextResponse.json({ categories, total, page, limit });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  
  export async function POST(request: Request) {
    await dbConnect();
    const body = await request.json();
    try {
      const newCategory = await Category.create(body);
      return NextResponse.json({ categories: [newCategory] }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
  
  export async function PUT(request: Request) {
    await dbConnect();
    const body = await request.json();
    try {
      const updatedCategory = await Category.findByIdAndUpdate(body.id, body, { new: true });
      if (!updatedCategory) return NextResponse.json({ error: "Category not found" }, { status: 404 });
      return NextResponse.json({ categories: [updatedCategory] });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
  
  export async function DELETE(request: Request) {
    await dbConnect();
    const body = await request.json();
    try {
      await Category.findByIdAndDelete(body.id);
      return NextResponse.json({ success: true });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }