// /app/api/admin/chart-stats/route.ts
import { NextRequest } from 'next/server';
import mongoose from "mongoose";
import Blog from "../models/Blog";
import Comment from "../models/Comment";
import "../models/User";
import "../models/Category";


export async function GET(request: Request) {
  try {
    if (mongoose.connections[0].readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI as string);
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user");

    const now = new Date();
    const monthlyData: { [key: string]: { posts: number } } = {};

    // Lấy 12 tháng gần nhất
    for (let i = now.getMonth(); i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = { posts: 0 };
    }
    
    const postFilter: any = {};
    if (userId) {
      postFilter.user = userId;
    }
    postFilter.createdAt = { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) };

    const posts = await Blog.find(postFilter);
    posts.forEach(post => {
      if (post.createdAt) {
        const date = new Date(post.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData[key]) monthlyData[key].posts += 1;
      }
    });

    console.log('Monthly Data:', monthlyData);

    const months = Object.keys(monthlyData);
    const postCounts = months.map(m => monthlyData[m].posts);

    return new Response(
      JSON.stringify({ months, postCounts }),
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