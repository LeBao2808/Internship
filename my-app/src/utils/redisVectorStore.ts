import { createHash } from "crypto";
import { Redis } from "@upstash/redis";

interface CategoryVector {
  id: string;
  content: string;
  metadata: {
    categoryName: string;
    categoryId: string;
    blogCount: number;
    blogIds: string[];
  };
  embedding?: number[];
}

class RedisVectorStore {
  private redis: Redis;
  private readonly VECTOR_KEY = "category_vectors:";
  private readonly INIT_KEY = "vector_store_initialized";

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL!,
      token: process.env.UPSTASH_REDIS_TOKEN!,
    });
  }

  async addCategoryVector(doc: CategoryVector) {
    const embedding = await this.generateEmbedding(doc.content);
    doc.embedding = embedding;
    await this.redis.set(`${this.VECTOR_KEY}${doc.id}`, JSON.stringify(doc));
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: text,
          model: "text-embedding-3-small",
        }),
      });

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      const hash = createHash("md5").update(text).digest("hex");
      return Array.from(hash).map((char) => char.charCodeAt(0) / 255);
    }
  }

  cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async findSimilarCategories(
    queryText: string,
    topK: number = 3
  ): Promise<CategoryVector[]> {
    const queryEmbedding = await this.generateEmbedding(queryText);
    const keys = await this.redis.keys(`${this.VECTOR_KEY}*`);
    const similarities: Array<{ doc: CategoryVector; score: number }> = [];

    for (const key of keys) {
      const docStr = await this.redis.get(key);
      if (docStr) {
        const doc: CategoryVector = docStr as CategoryVector;
        if (doc.embedding) {
          const score = this.cosineSimilarity(queryEmbedding, doc.embedding);
          similarities.push({ doc, score });
        }
      }
    }

    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((item) => item.doc);
  }

  async setInitialized(status: boolean) {
    console.log('ThisInnit key:', this.INIT_KEY);
    await this.redis.set(this.INIT_KEY, status ? "1" : "0");
  }

  async getInitialized(): Promise<boolean> {
    const result = await this.redis.get(this.INIT_KEY);
    console.log('index initialized:', result);
    
    return result === 1 || result === "1";
  }

  async removeCategoryVector(categoryId: string) {
    await this.redis.del(`${this.VECTOR_KEY}${categoryId}`);
  }
}

export const redisVectorStore = new RedisVectorStore();
export type { CategoryVector };
