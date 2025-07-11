import { ragService } from './ragService';

export async function onBlogCreated(blog: any) {
  try {
    await ragService.updateCategoryVector(blog.category.toString());
    console.log(`Updated category vector for blog ${blog._id}`);
  } catch (error) {
    console.error('Failed to update category vector:', error);
  }
}

export async function onBlogUpdated(blog: any) {
  try {
    await ragService.updateCategoryVector(blog.category.toString());
    console.log(`Updated category vector for blog ${blog._id}`);
  } catch (error) {
    console.error('Failed to update category vector:', error);
  }
}

export async function onBlogDeleted(blog: any) {
  try {
    await ragService.updateCategoryVector(blog.category.toString());
    console.log(`Updated category vector after deleting blog ${blog._id}`);
  } catch (error) {
    console.error('Failed to update category vector:', error);
  }
}