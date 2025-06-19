// /app/api/admin/stats/route.ts
import { NextRequest } from 'next/server';
import Blog from '../models/Blog';
import Comment from '../models/Comment';
import User from '../models/User';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // Kết nối với MongoDB nếu chưa kết nối
    if (mongoose.connections[0].readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI as string);
    }


    const totalPosts = await Blog.countDocuments();
    const totalComments = await Comment.countDocuments();
    const totalUsers = await User.countDocuments();

    // Tính tỉ lệ tương tác (đơn giản hóa)
    const interactionRate = Math.round((totalComments / totalPosts) * 100) || 0;

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