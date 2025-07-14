import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/resources/lib/mongodb";
import Category from "../models/Category";
import { z } from "zod";
import generateSlug from "@/utils/generateSlug";
import { ragService } from "@/utils/ragService";

// const CategorySchema = z.object({
//   description: z.string().max(200).optional(),
// });

export async function GET(request: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
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
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    let sort: any = {};
    if (sortParam) {
      const [field, direction] = sortParam.split(":");
      sort[field] = direction === "desc" ? -1 : 1;
    } else {
      sort = { name: 1 }; // Default sort by latest createdAt
    }

    const [categories, total] = await Promise.all([
      Category.find(query).skip(skip).limit(limit).sort(sort),
      Category.countDocuments(query),
    ]);
    console.log(categories);

    return NextResponse.json({ categories, total, page, limit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  const body = await request.json();
  console.log(body);
  // const parsed = CategorySchema.safeParse(body);
  // if (!parsed.success) {
  //   return NextResponse.json(
  //     { error: parsed.error.format() },
  //     { status: 400 }
  //   );
  // }
  try {
    const slug = generateSlug(body.name);
    const newCategory = await Category.create({ ...body, slug });
    if (newCategory._id) {
      console.log("New category created:", newCategory);
      await ragService.updateCategoryVector(newCategory._id.toString());
    }
    return NextResponse.json({ categories: [newCategory] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  await dbConnect();
  const body = await request.json();
  console.log(body);
  // const parsed = CategorySchema.safeParse(body);

  // if (!parsed.success) {
  //   return NextResponse.json(
  //     { error: parsed.error.format() },
  //     { status: 400 }
  //   );
  // }
  try {
    const slug = generateSlug(body.name);
    body.slug = slug;
    const updatedCategory = await Category.findByIdAndUpdate(body.id, body, {
      new: true,
    });
    if (!updatedCategory)
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    if (updatedCategory._id) {
      await ragService.updateCategoryVector(updatedCategory._id.toString());
    }
    return NextResponse.json({ categories: [updatedCategory] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  await dbConnect();
  const body = await request.json();
  console.log(body);
  try {
    Category.findByIdAndUpdate(body.id, {
      ...body,
      deletedAt: new Date(),
      deleted: true,
    });
    await Category.findByIdAndDelete(body.id);
    const categoryId = body.id.toString();
    await ragService.updateCategoryVector(categoryId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
