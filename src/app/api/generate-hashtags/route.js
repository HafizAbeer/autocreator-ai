import { NextResponse } from "next/server";
import { aiService } from "@/services/ai";

export async function POST(req) {
  try {
    const { topic, platform } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const systemPrompt = `You are an SEO and Social Media Hashtag expert.
Generate a list of exactly 30 highly optimized hashtags for ${platform || "TikTok/Instagram"}.
Categorize them into:
1. Broad/Trending (10)
2. Niche Specific (10)
3. Small/Hyper-targeted (10)
Output ONLY the hashtags separated by spaces, with the # symbol.`;

    const prompt = `Topic: "${topic}"\nPlatform: ${platform || "TikTok"}`;

    const hashtags = await aiService.generateText({ prompt, systemPrompt });

    return NextResponse.json({ hashtags });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to generate hashtags" }, { status: 500 });
  }
}
