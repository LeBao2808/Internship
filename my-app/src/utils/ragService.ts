import { redisVectorStore as vectorStore, CategoryVector } from './redisVectorStore';



interface UserProfile {
  viewedCategories: string[];
  viewedTitles: string[];
  preferences: string;
}

export class RAGService {
  async initializeIfNeeded() {
    if (!(await vectorStore.getInitialized())) {
      await this.indexCategories();
      await vectorStore.setInitialized(true);
      console.log('Category vectors initialized');
    }
  }

  async forceReindex() {
    await this.indexCategories();
    console.log('Category vectors re-indexed');
  }

  async indexCategories() {
    const dbConnect = (await import('@/resources/lib/mongodb')).default;
    const Blog = (await import('@/app/api/models/Blog')).default;
    const Category = (await import('@/app/api/models/Category')).default;
    
    await dbConnect();
    const categories = await Category.find();
    
    for (const category of categories) {
      const blogs = await Blog.find({ category: category._id });
      const content = blogs.map(blog => `${blog.title} ${blog.content}`).join(' ');
      
      const categoryVector: CategoryVector = {
        id: (category._id as any).toString(),
        content,
        metadata: {
          categoryName: category.name,
          categoryId: (category._id as any).toString(),
          blogCount: blogs.length,
          blogIds: blogs.map(blog => (blog._id as any).toString())
        }
      };
      console.log(`Indexing category: ${category.name} with ${blogs.length} blogs`);
      console.log('Category vector:', categoryVector);
      await vectorStore.addCategoryVector(categoryVector);
    }
  }

  async updateCategoryVector(categoryId: string) {
    const dbConnect = (await import('@/resources/lib/mongodb')).default;
    const Blog = (await import('@/app/api/models/Blog')).default;
    const Category = (await import('@/app/api/models/Category')).default;
    
    await dbConnect();
    const category = await Category.findById(categoryId);
    if (!category) return;
    
    const blogs = await Blog.find({ category: categoryId });
    const content = blogs.map(blog => `${blog.title} ${blog.content}`).join(' ');
    
    const categoryVector: CategoryVector = {
      id: categoryId,
      content,
      metadata: {
        categoryName: category.name,
        categoryId,
        blogCount: blogs.length,
        blogIds: blogs.map(blog => (blog._id as any).toString())
      }
    };
    
    await vectorStore.addCategoryVector(categoryVector);
  }

  async getRecommendations(userProfile: UserProfile, excludeIds: string[], topK: number = 3): Promise<string[]> {
    const query = `${userProfile.preferences} ${userProfile.viewedCategories.join(' ')}`;
    console.log('Querying for similar categories:', query);
    const similarCategories = await vectorStore.findSimilarCategories(query, 3);
    console.log('Found similar categories:', similarCategories);
  
    const recommendedBlogIds: string[] = [];
    for (const categoryVector of similarCategories) {
      const availableBlogIds = categoryVector.metadata.blogIds
        .filter(blogId => !excludeIds.includes(blogId))
        .slice(0, Math.ceil(topK / similarCategories.length));
      recommendedBlogIds.push(...availableBlogIds);
    }
    
    return recommendedBlogIds.slice(0, topK);
  }

  async findRelatedBlogs(question: string, categoriesCount: number): Promise<string[]> {
    const similarCategories = await vectorStore.findSimilarCategories(question, categoriesCount);
    
    const relatedBlogIds: string[] = [];
    for (const categoryVector of similarCategories) {
      relatedBlogIds.push(...categoryVector.metadata.blogIds);
    }
    
    return relatedBlogIds;
  }

  buildUserProfile(histories: any[]): UserProfile {
    const categories = histories.map(h => (h.blog as any)?.category?.name).filter(Boolean);
    const titles = histories.map(h => (h.blog as any)?.title).filter(Boolean);
    
    const categoryCount: Record<string, number> = {};
    categories.forEach(cat => {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);
    
    return {
      viewedCategories: topCategories,
      viewedTitles: titles.slice(-5),
      preferences: `Người dùng quan tâm đến ${topCategories.join(', ')}`
    };
  }
}

export const ragService = new RAGService();