// /app/api/admin/chart-stats/route.ts
import { NextRequest } from 'next/server';
import Blog from '../models/Blog';
import Comment from '../models/Comment';
import mongoose from 'mongoose';
require('../../api/models/Category');
require('../../api/models/Comment');

export async function GET() {
  try {
    if (mongoose.connections[0].readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI as string);
    }

    const now = new Date();
    const monthlyData: { [key: string]: { posts: number; comments: number } } = {};

    // Khởi tạo dữ liệu cho 6 tháng gần nhất
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = { posts: 0, comments: 0 };
    }

    // Lấy danh sách bài viết theo tháng
    const posts = await Blog.find({
      createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) }
    });

    // Lấy danh sách bình luận theo tháng
    const comments = await Comment.find({
      createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) }
    });


    posts.forEach(post => {
        if (post.createdAt) {
  const date = new Date(post.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key]) monthlyData[key].posts += 1;
}
     
    });

    comments.forEach(comment => {
            if (comment.createdAt) {
      const date = new Date(comment.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key]) monthlyData[key].comments += 1;
    }});

    const months = Object.keys(monthlyData);
    const postCounts = months.map(m => monthlyData[m].posts);
    const commentCounts = months.map(m => monthlyData[m].comments);

    return new Response(
      JSON.stringify({ months, postCounts, commentCounts }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu biểu đồ:', error);
    return new Response(
      JSON.stringify({ error: 'Không thể tải dữ liệu biểu đồ' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}