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

    const summaryCheck = await chatbotService.checkForBlogSummary(question);
    if (summaryCheck.isSummaryRequest && summaryCheck.blog) {
      const answer = await chatbotService.callGemini(summaryCheck.summary);
      return NextResponse.json({ answer });
    }

    const systemData = await chatbotService.getSystemData();
    const relatedBlogs = await chatbotService.getRelatedBlogs(question, 3);
    console.log("Related blogs:", relatedBlogs);
    const relatedDocs = await redisVectorStore.findSimilarDocuments(
      question,
      2
    );
    const docContext = relatedDocs.length > 0
        ? `\n\nThông tin từ tài liệu:\n${relatedDocs
            .map((doc) => doc.content)
            .join("\n\n")}`
        : "";

    const systemContext =
      chatbotService.buildSystemContext(systemData, relatedBlogs, session) +
      docContext;
    const prompt = CHATBOT_PROMPTS.MAIN_ASSISTANT(
      systemContext,
      context,
      question
    );
    console.log("Prompt:", prompt);
    let answer = await chatbotService.callGemini(prompt);

    answer = chatbotService.convertToClickableLinks(answer, relatedBlogs);
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Chatbot error:", error);
    return NextResponse.json({
      answer: "Có lỗi xảy ra, vui lòng thử lại sau.",
    });
  }
}
