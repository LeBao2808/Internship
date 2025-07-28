import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/resources/lib/auth.config";
import dbConnect from "@/resources/lib/mongodb";
import Blog from "../../api/models/Blog";
import User from "../models/User";
import ViewHistory from "../models/ViewHistory";
import {
  getCachedRecommendation,
  setCachedRecommendation,
} from "@/utils/cache";
import { ragService } from "@/utils/ragService";

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ recommendations: [] });
  }

  const userId = session.user.email;


  const cached = await getCachedRecommendation(userId);

  if (cached) {
    // console.log("Cache hit for user:", userId);
    // console.log("Cached recommendations:", cached);
    return NextResponse.json({ recommendations: cached });
  }

  const user = await User.findOne({ email: session.user.email });

  const histories = await ViewHistory.find({ user: user?._id }).populate({
    path: "blog",
    populate: { path: "category", select: "name" },
  });


  await ragService.initializeIfNeeded();

  const userProfile = await ragService.buildUserProfile(histories, user?._id as string);

  const viewedBlogIds = histories.map(h => (h.blog as any)?._id?.toString()).filter(Boolean);

  const recommendedBlogIds = await ragService.getRecommendations(userProfile, viewedBlogIds, 3);

  const recommendations = await Blog.find({ _id: { $in: recommendedBlogIds } })
    .populate("category", "name")
    .populate("user", "name");

  
  if (recommendations.length < 3) {
    console.log("Not enough recommendations, adding fallback blogs");
    const fallbackBlogs = await Blog.find({ 
      _id: { $nin: [...viewedBlogIds, ...recommendedBlogIds] } 
    })
    .populate("category", "name")
    .populate("user", "name")
    .limit(5 - recommendations.length);
    recommendations.push(...fallbackBlogs);
  }
  // console.log("Recommendations:", recommendations);
  await setCachedRecommendation(userId, recommendations);

  return NextResponse.json({ recommendations });
}
