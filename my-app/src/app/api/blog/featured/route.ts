import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/resources/lib/mongodb';
import Blog from '../../models/Blog'; // Điều chỉnh đường dẫn nếu cần
require('../../models/Blog');
require('../../models/Category');
require('../../models/User');
export async function GET() {
  try {
    await dbConnect();

    const featuredBlogs = await Blog.find({ featured: true })
      .populate('user', 'name')
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: featuredBlogs });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}