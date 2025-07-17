import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/resources/lib/auth.config";
import dbConnect from "@/resources/lib/mongodb";
import Document from "@/app/api/models/Document";
import { redisVectorStore } from "@/utils/redisVectorStore";
import mammoth from "mammoth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    let text = '';
    
    if (file.type === 'text/plain') {
      text = await file.text();
    } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      text = await file.text();
    }
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Could not extract text from file" }, { status: 400 });
    }
    const embedding = await redisVectorStore.generateEmbedding(text);

    await dbConnect();
    const document = new Document({
      name: file.name,
      type: file.type,
      size: file.size,
      content: text,
      embedding,
    });

    await document.save();
    await redisVectorStore.addDocumentVector({
      id: document._id.toString(),
      content: text,
      embedding,
      metadata: {
        name: file.name,
        type: file.type,
        size: file.size,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const documents = await Document.find().select("name type size createdAt").sort({ createdAt: -1 });
    return NextResponse.json({ documents });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    await dbConnect();
    await Document.findByIdAndDelete(id);
    

    const redis = redisVectorStore.getRedisClient();
    const chunkKeys = await redis.keys(`document_vectors:${id}_chunk_*`);
    
    if (chunkKeys.length > 0) {
      await Promise.all(chunkKeys.map(key => redis.del(key)));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Document deletion error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}