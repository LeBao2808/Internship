import { createHash } from 'crypto';

interface VectorDocument {
  id: string;
  content: string;
  metadata: {
    title: string;
    category: string;
    author: string;
    blogId: string;
  };
  embedding?: number[];
}

class VectorStore {
  private documents: Map<string, VectorDocument> = new Map();
  private embeddings: Map<string, number[]> = new Map();
  private isInitialized: boolean = false;

  async addDocument(doc: VectorDocument) {
    const embedding = await this.generateEmbedding(doc.content);
    doc.embedding = embedding;
    this.documents.set(doc.id, doc);
    this.embeddings.set(doc.id, embedding);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-3-small'
        })
      });
      
      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      // Fallback: simple hash-based embedding
      const hash = createHash('md5').update(text).digest('hex');
      return Array.from(hash).map(char => char.charCodeAt(0) / 255);
    }
  }

  cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async findSimilar(queryText: string, topK: number = 5): Promise<VectorDocument[]> {
    const queryEmbedding = await this.generateEmbedding(queryText);
    const similarities: Array<{ doc: VectorDocument; score: number }> = [];

    for (const [id, doc] of this.documents) {
      if (doc.embedding) {
        const score = this.cosineSimilarity(queryEmbedding, doc.embedding);
        similarities.push({ doc, score });
      }
    }

    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(item => item.doc);
  }

  setInitialized(status: boolean) {
    this.isInitialized = status;
  }

  getInitialized(): boolean {
    return this.isInitialized;
  }

  removeDocument(id: string) {
    this.documents.delete(id);
    this.embeddings.delete(id);
  }
}

export const vectorStore = new VectorStore();
export type { VectorDocument };