// /app/api/admin/stats/route.ts
import { NextRequest } from 'next/server';
import Blog from '../models/Blog';
import Comment from '../models/Comment';
import User from '../models/User';
import mongoose from 'mongoose';
import "../models/Category";
import dbConnect from "@/resources/lib/mongodb";
 
export async function GET(request: NextRequest) {
  try {
    // Kết nối với MongoDB nếu chưa kết nối
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user");

    let totalPosts, totalComments;

    if (userId) {
      // Thống kê cho user cụ thể
      totalPosts = await Blog.countDocuments({ user: userId });
      totalComments = await Comment.countDocuments({ user: userId });
    } else {
      // Thống kê toàn hệ thống
      totalPosts = await Blog.countDocuments();
      totalComments = await Comment.countDocuments();
    }

    const totalUsers = await User.countDocuments();

    const interactionRate = Math.round((totalComments / (totalPosts || 1)) * 100) || 0;

    return new Response(
      JSON.stringify({
        totalPosts,
        totalComments,
        totalUsers,
        interactionRate,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error);
    return new Response(
      JSON.stringify({ error: 'Không thể lấy dữ liệu thống kê' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}