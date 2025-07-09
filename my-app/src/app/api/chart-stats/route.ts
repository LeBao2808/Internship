// /app/api/admin/chart-stats/route.ts
import { NextRequest } from 'next/server';
import mongoose from "mongoose";
import Blog from "../models/Blog";
import Comment from "../models/Comment";
require('../../api/models');
export async function GET(request: Request) {
  try {
    if (mongoose.connections[0].readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI as string);
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user");

    const now = new Date();
    const monthlyData: { [key: string]: { posts: number; comments: number } } = {};

    // Lấy 12 tháng gần nhất
    for (let i = now.getMonth(); i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = { posts: 0, comments: 0 };
    }
    
    const postFilter: any = {};
    const commentFilter: any = {};
    if (userId) {
      postFilter.user = userId;
      commentFilter.user = userId;
    }
    postFilter.createdAt = { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) };
    commentFilter.createdAt = { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) };

    const posts = await Blog.find(postFilter);
    const comments = await Comment.find(commentFilter);
    console.log('Posts:', posts.length, 'Comments:', comments.length);
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
      }
    });

    console.log('Monthly Data:', monthlyData);

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