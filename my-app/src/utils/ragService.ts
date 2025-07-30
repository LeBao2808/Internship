import {
  redisVectorStore as vectorStore,
  CategoryVector,
} from "./redisVectorStore";
import Blog from "@/app/api/models/Blog";
import Category from "@/app/api/models/Category";
import dbConnect from "@/resources/lib/mongodb";
import { IBlog } from "./type";
import RecomendationCategory from "@/app/api/models/RecomendationCategory";

interface UserProfile {
  viewedCategories: string[];
  viewedTitles: string[];
  preferences: string;
  see: string;
}

export class RAGService {
  private readonly VECTOR_KEY = "category_vectors:";
  async initializeIfNeeded() {
    if (!(await vectorStore.getInitialized())) {
      await this.indexCategories();
      await vectorStore.setInitialized(true);
      console.log("Category vectors initialized");
    }
  }

  async forceReindex() {
    await this.indexCategories();
    console.log("Category vectors re-indexed");
  }

  async indexCategories() {
    await dbConnect();
    const categories = await Category.find();

    for (const category of categories) {
      const blogs = await Blog.find({ category: category._id }).populate(
        "user",
        "name"
      );

      for (const blog of blogs) {
        const content = `Category: ${category.name}. Author: ${
          (blog.user as any)?.name || "Unknown"
        }.  View: bài viết này có ${blog.view} lượt xem.  Title: ${blog.title} ${blog.content}`;

        const categoryVector: CategoryVector = {
          id: `${category._id}_${blog._id}`,
          content,
          metadata: {
            categoryName: category.name,
            categoryId: (category._id as any).toString(),
            blogIds: (blog._id as any).toString(),
            blogTitle: blog.title,
          },
        };
        await vectorStore.addCategoryVector(categoryVector);
      }
    }
  }

  async updateCategoryVector(categoryId: string) {
    await dbConnect();
    const category = await Category.findById(categoryId);
    if (!category) return;
    const keys = await vectorStore
      .getRedisClient()
      .keys(`${this.VECTOR_KEY}${categoryId}_*`);
    if (keys.length > 0) {
      await Promise.all(
        keys.map((key) => vectorStore.getRedisClient().del(key))
      );
    }
    const blogs = await Blog.find({ category: categoryId }).populate(
      "user",
      "name"
    );

    for (const blog of blogs) {
      const content = `Category: ${category.name}. Author: ${
        (blog.user as any)?.name || "Unknown"
      }.  View: bài viết này có ${blog.view} lượt xem. Title: ${blog.title} ${blog.content}`;

      const categoryVector: CategoryVector = {
        id: `${categoryId}_${blog._id}`,
        content,
        metadata: {
          categoryName: category.name,
          categoryId: categoryId,
          blogIds: (blog._id as any).toString(),
          blogTitle: blog.title,
        },
      };

      await vectorStore.addCategoryVector(categoryVector);
    }

    console.log(
      `Updated ${blogs.length} blog vectors for category: ${category.name}`
    );
  }

  async findSimilarCategoriesForRecommendation(
    queryText: string,
    excludeIds: string[],
    topK: number = 3
  ): Promise<string[]> {
    const similarCategories = await vectorStore.findSimilarCategoriesExcluding(
      queryText,
      excludeIds,
      topK
    );
    console.log("similarCategories", similarCategories);
    const recommendedBlogIds: string[] = [];
    for (const categoryVector of similarCategories) {
      const blogIdsArray = Array.isArray(categoryVector.metadata.blogIds)
        ? categoryVector.metadata.blogIds
        : [categoryVector.metadata.blogIds];

      recommendedBlogIds.push(...blogIdsArray);

      if (recommendedBlogIds.length >= topK) break;
    }

    return recommendedBlogIds.slice(0, topK);
  }

  async getRecommendations(
    userProfile: UserProfile,
    excludeIds: string[],
    topK: number = 3
  ): Promise<string[]> {
    const query: string = `${userProfile.preferences}
 ${userProfile.see}  
 ưu tiên sắp xếp theo số lượt xem (view) giảm dần.
Tức là các blog có cùng điều kiện thì blog nào có lượt xem cao hơn sẽ được hiển thị trước.`;

    console.log("Final query:", query);
    const recommendedBlogIds =
      await this.findSimilarCategoriesForRecommendation(
        query,
        excludeIds,
        topK
      );
    console.log("recommendation", recommendedBlogIds);

    return recommendedBlogIds;
  }

  async findRelatedBlogs(
    question: string,
    topK: number = 3
  ): Promise<string[]> {
    const similarCategories = await vectorStore.findSimilarCategories(
      question,
      topK
    );
    console.log("similarCategories", similarCategories);
    const relatedBlogIds: string[] = [];
    for (const categoryVector of similarCategories) {
      const blogIdsArray = Array.isArray(categoryVector.metadata.blogIds)
        ? categoryVector.metadata.blogIds
        : [categoryVector.metadata.blogIds];
      relatedBlogIds.push(...blogIdsArray);
    }
    return relatedBlogIds;
  }

  async buildUserProfile(
    histories: any[],
    userId: string
  ): Promise<UserProfile> {
    const categories = histories
      .map((h) => (h.blog as IBlog)?.category?.name)
      .filter(Boolean);
    const titles = histories
      .map((h) => (h.blog as IBlog)?.title)
      .filter(Boolean);
    const categoryCount: Record<string, number> = {};
    categories.forEach((cat) => {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);
    // Lấy thông tin từ RecomendationCategory
    const recommendationCategory = await RecomendationCategory.findOne({
      user: userId,
    }).populate("categories", "name");
    const recommendedCategories =
      recommendationCategory?.categories?.map((cat: any) => cat.name) || [];

    console.log("topCategories", topCategories);
    const isTopCategoriesEmpty = topCategories.length === 0;
    return {
      viewedCategories: topCategories,
      viewedTitles: titles.slice(-5),
      preferences: `Người dùng quan tâm đến ${recommendedCategories.join(
        ", "
      )}`,
      see: isTopCategoriesEmpty
        ? ""
        : `Thể loại người dùng hay xem nhất ${topCategories.join(", ")}`,
    };
  }
}

export const ragService = new RAGService();
