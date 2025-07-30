import Blog from "../../models/Blog";
import dbConnect from "@/resources/lib/mongodb";
import ViewHistory from "../../models/ViewHistory";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await dbConnect() ; 
    const viewCounts = await ViewHistory.aggregate([
      { $group: { _id: "$blog", count: { $sum: 1 } } }
    ]);

    for (const { _id: blogId, count } of viewCounts) {
      await Blog.findByIdAndUpdate(blogId, { view: count });
    }

    console.log(`Updated ${viewCounts.length} blogs`);
    return NextResponse.json({ success: true, updated: viewCounts.length });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to update blog views' }, { status: 500 });
  }
}