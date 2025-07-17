import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/resources/lib/auth.config";
import { chatbotService } from "@/utils/chatbotService";
import { CHATBOT_PROMPTS } from "@/utils/promptTemplates";
import { redisVectorStore } from "@/utils/redisVectorStore";


export async function POST(req: Request) {
  const { question, context } = await req.json();

  try {
    const session = await getServerSession(authOptions);
    
    // Check if this is a blog summary request
    const summaryCheck = await chatbotService.checkForBlogSummary(question);
    if (summaryCheck.isSummaryRequest && summaryCheck.blog) {
      const answer = await chatbotService.callGemini(summaryCheck.summary);
      return NextResponse.json({ answer });
    }

    
    // Get system data (cached)
    const systemData = await chatbotService.getSystemData();
    
    // Get related blogs using RAG
    const relatedBlogs = await chatbotService.getRelatedBlogs(question);
    console.log("Related blogs:", relatedBlogs);
    
    // Get related documents
    const relatedDocs = await redisVectorStore.findSimilarDocuments(question, 2);
    const docContext = relatedDocs.length > 0 
      ? `\n\nThông tin từ tài liệu:\n${relatedDocs.map(doc => doc.content).join('\n\n')}`
      : '';
    
    // Build system context
    const systemContext = chatbotService.buildSystemContext(systemData, relatedBlogs, session) + docContext;
    
    // Create prompt using template
    const prompt = CHATBOT_PROMPTS.MAIN_ASSISTANT(systemContext, context, question);
    console.log("Prompt:", prompt);
    // Call AI API
    let answer = await chatbotService.callGemini(prompt);
    
    // Convert to clickable links
    answer = chatbotService.convertToClickableLinks(answer, relatedBlogs);
    // console.log("summaryCheck:", summaryCheck);
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Chatbot error:", error);
    return NextResponse.json({
      answer: "Có lỗi xảy ra, vui lòng thử lại sau.",
    });
  }
}

