import { createHash } from "crypto";
import { Redis } from "@upstash/redis";
import { pipeline } from "@xenova/transformers";
import cosineSimilarity from 'compute-cosine-similarity';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
interface CategoryVector {
  id: string;
  content: string;
  metadata: {
    categoryName: string;
    categoryId: string;
    blogIds: string[];
    blogTitle?: string;
  };
  embedding?: number[];
}

class RedisVectorStore {
  private redis: Redis;
  private readonly VECTOR_KEY = "category_vectors:";
  private readonly INIT_KEY = "vector_store_initialized";

  getRedisClient(): Redis {
    return this.redis;
  }

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL!,
      token: process.env.UPSTASH_REDIS_TOKEN!,
    });
  }

  hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; 
    }
    return hash;
  }

  async addCategoryVector(doc: CategoryVector) {
    const embedding = await this.generateEmbedding(doc.content);

    doc.embedding = embedding;
    await this.redis.set(`${this.VECTOR_KEY}${doc.id}`, JSON.stringify(doc));
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      console.log("Using Xenova Transformers for embedding");

      const embedder = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
      );
      const result = await embedder(text, { pooling: "mean", normalize: true });

      const embedding = Array.from(result.data);
      console.log(
        "Successfully generated embedding with shape:",
        embedding.length
      );
      return embedding;
    } catch (error) {
      console.error(
        "Error with Hugging Face embedding, using fallback:",
        error
      );

      const words = text
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 0);
      const wordFreq: Record<string, number> = {};
      words.forEach((word) => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });

      const vector = new Array(1536).fill(0);
      Object.entries(wordFreq).forEach(([word, freq]) => {
        const position = Math.abs(this.hashCode(word)) % 1536;
        vector[position] = (freq as number) / words.length;
      });

      const magnitude = Math.sqrt(
        vector.reduce((sum, val) => sum + val * val, 0)
      );
      return vector.map((val) => val / (magnitude || 1));
    }
  }


 calculateSimilarity(a: number[], b: number[]): number {
  const result = cosineSimilarity(a, b);
  return result ?? 0; // fallback nếu có thể trả về null
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
        let doc: CategoryVector;
        try {
          // Handle different data types from Redis
          if (typeof docStr === "string") {
            doc = JSON.parse(docStr);
          } else if (typeof docStr === "object") {
            doc = docStr as unknown as CategoryVector;
          } else {
            console.error("Unexpected data type from Redis:", typeof docStr);
            continue;
          }

          if (doc.embedding) {
            const score = this.calculateSimilarity(queryEmbedding, doc.embedding);
            similarities.push({ doc, score });
          }
        } catch (error) {
          console.error("Error parsing vector data:", error);
          continue;
        }
      }
    }

    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((item) => item.doc);
  }

  async findSimilarCategoriesExcluding(
    queryText: string,
    excludeIds: string[],
    topK: number = 3
  ): Promise<CategoryVector[]> {
    const queryEmbedding = await this.generateEmbedding(queryText);
    const keys = await this.redis.keys(`${this.VECTOR_KEY}*`);
    const similarities: Array<{ doc: CategoryVector; score: number; viewCount: number; finalScore: number }> = [];

    for (const key of keys) {
      const docStr = await this.redis.get(key);
      if (docStr) {
        let doc: CategoryVector;
        try {
          if (typeof docStr === "string") {
            doc = JSON.parse(docStr);
          } else if (typeof docStr === "object") {
            doc = docStr as unknown as CategoryVector;
          } else {
            continue;
          }

          const blogIdsArray = Array.isArray(doc.metadata.blogIds)
            ? doc.metadata.blogIds
            : [doc.metadata.blogIds];
          
          const hasExcludedBlog = blogIdsArray.some(blogId => excludeIds.includes(blogId));
          if (hasExcludedBlog) continue;

          if (doc.embedding) {
            const similarityScore = this.calculateSimilarity(queryEmbedding, doc.embedding);
            
            // Extract view count from content
            const viewMatch = doc.content.match(/có (\d+) lượt xem/);
            const viewCount = viewMatch ? parseInt(viewMatch[1]) : 0;
            
            // Normalize view count (log scale to prevent dominance)
            const normalizedViewScore = Math.log(viewCount + 1) / 10;
            
            // Combine similarity (70%) with view popularity (30%)
            const finalScore = (similarityScore * 0.7) + (normalizedViewScore * 0.3);
            
            similarities.push({ doc, score: similarityScore, viewCount, finalScore });
          }
        } catch (error) {
          continue;
        }
      }
    }

    return similarities
      .sort((a, b) => {
        // Primary sort by final score, secondary by view count
        if (Math.abs(a.finalScore - b.finalScore) < 0.01) {
          return b.viewCount - a.viewCount;
        }
        return b.finalScore - a.finalScore;
      })
      .slice(0, topK)
      .map((item) => item.doc);
  }

  async setInitialized(status: boolean) {
    console.log("ThisInnit key:", this.INIT_KEY);
    await this.redis.set(this.INIT_KEY, status ? "1" : "0");
  }

  async getInitialized(): Promise<boolean> {
    const result = await this.redis.get(this.INIT_KEY);
    console.log("index initialized:", result);

    return result === 1 || result === "1";
  }

  async removeCategoryVector(categoryId: string, blogId: string) {
    await this.redis.del(`${this.VECTOR_KEY}${categoryId}_${blogId}`);
  }

  // async addDocumentVector(doc: any) {
  //   // Split document into chunks for better search
  //   const chunks = this.splitIntoChunks(doc.content, 500);
  //   for (let i = 0; i < chunks.length; i++) {
  //     const chunkDoc = {
  //       ...doc,
  //       id: `${doc.id}_chunk_${i}`,
  //       content: chunks[i],
  //       embedding: await this.generateEmbedding(chunks[i]),
  //       metadata: {
  //         ...doc.metadata,
  //         chunkIndex: i,
  //         originalDocId: doc.id,
  //       },
  //     };
  //     await this.redis.set(
  //       `document_vectors:${chunkDoc.id}`,
  //       JSON.stringify(chunkDoc)
  //     );
  //   }
  // }

  async addDocumentVector(doc: any) {
  console.log("Splitting document into chunks for vector storage");
  const chunks = await this.splitIntoChunks(doc.content, 500);
  for (let i = 0; i < chunks.length; i++) {
    const chunkDoc = {
      ...doc,
      id: `${doc.id}_chunk_${i}`,
      content: chunks[i],
      embedding: await this.generateEmbedding(chunks[i]),
      metadata: {
        ...doc.metadata,
        chunkIndex: i,
        originalDocId: doc.id,
      },
    };
    await this.redis.set(
      `document_vectors:${chunkDoc.id}`,
      JSON.stringify(chunkDoc)
    );
  }
}

  // splitIntoChunks(text: string, chunkSize: number): string[] {
  //   const sentences = text.split(/[.!?]+/);
  //   const chunks = [];
  //   let currentChunk = "";

  //   for (const sentence of sentences) {
  //     if ((currentChunk + sentence).length > chunkSize && currentChunk) {
  //       chunks.push(currentChunk.trim());
  //       currentChunk = sentence;
  //     } else {
  //       currentChunk += sentence + ".";
  //     }
  //   }
  //   if (currentChunk) chunks.push(currentChunk.trim());
  //   return chunks;
  // }
  async splitIntoChunks(text: string, chunkSize: number): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunkSize,
    chunkOverlap: 50,
  });
  
  return await splitter.splitText(text);
}

  async removeDocumentVector(docId: string) {
    await this.redis.del(`document_vectors:${docId}`);
  }

  async findSimilarDocuments(
    queryText: string,
    topK: number = 3
  ): Promise<any[]> {
    const queryEmbedding = await this.generateEmbedding(queryText);
    const keys = await this.redis.keys("document_vectors:*");
    const similarities: Array<{
      doc: any;
      score: number;
      exactMatchBonus: number;
    }> = [];

    const queryLower = queryText.toLowerCase();
    const queryWords = queryLower.split(/\W+/).filter((w) => w.length > 2);

    for (const key of keys) {
      const docStr = await this.redis.get(key);
      if (docStr) {
        try {
          let doc: any;
          if (typeof docStr === "string") {
            doc = JSON.parse(docStr);
          } else if (typeof docStr === "object") {
            doc = docStr;
          } else {
            continue;
          }

          if (doc.embedding) {
            const embeddingScore = this.calculateSimilarity(
              queryEmbedding,
              doc.embedding
            );

            let exactMatchBonus = 0;
            const contentLower = doc.content.toLowerCase();

            if (contentLower.includes(queryLower)) {
              exactMatchBonus += 0.3; 
            }

            const matchedWords = queryWords.filter((word) =>
              contentLower.includes(word)
            );
            exactMatchBonus += (matchedWords.length / queryWords.length) * 0.2;

            const finalScore = embeddingScore + exactMatchBonus;

            similarities.push({
              doc,
              score: finalScore,
              exactMatchBonus,
            });
          }
        } catch (error) {
          console.error("Error parsing document data:", error);
          continue;
        }
      }
    }

    console.log(
      "Similarities found:",
      similarities.map((s) => ({
        content: s.doc.content.substring(0, 50) + "...",
        score: s.score,
        exactMatchBonus: s.exactMatchBonus,
      }))
    );

    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((item) => item.doc);
  }
}

export const redisVectorStore = new RedisVectorStore();
export type { CategoryVector };
