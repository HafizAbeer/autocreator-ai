import { NextResponse } from "next/server";
import { aiService } from "@/services/ai";

export async function POST(req) {
  try {
    const { topic, niche, targetAudience, duration } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const systemPrompt = `You are an expert social media scriptwriter specializing in viral short-form content. 
Your goal is to write highly engaging, retention-focused video scripts for TikTok, Facebook Reels, and Instagram Reels.
Use strong hooks, clear pacing, and a compelling call to action.`;

    const prompt = `Write a ${duration || "60-second"} script about "${topic}".
Niche: ${niche || "General"}
Target Audience: ${targetAudience || "Everyone"}

Format the response clearly with:
- Hook (first 3 seconds)
- Intro
- Main Body (with visual cues in brackets like [Show text on screen: ...])
- Call to Action (CTA)

Please provide ONLY the script text, no conversational filler.`;

    const script = await aiService.generateText({
      prompt,
      systemPrompt,
    });

    return NextResponse.json({ script });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to generate script" }, { status: 500 });
  }
}
