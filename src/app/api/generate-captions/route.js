import { NextResponse } from "next/server";
import { aiService } from "@/services/ai";

export async function POST(req) {
  try {
    const { topic, platform, tone } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const systemPrompt = `You are a social media manager expert at writing viral captions.
Generate 3 distinct caption options for the given topic, optimized for ${platform || "Instagram"}.
Tone should be ${tone || "engaging"}.
Include a strong Call To Action (CTA) and relevant emojis in each option.`;

    const prompt = `Topic: "${topic}"\nPlatform: ${platform || "Instagram"}\nTone: ${tone || "engaging"}`;

    const captions = await aiService.generateText({ prompt, systemPrompt });

    return NextResponse.json({ captions });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to generate captions" }, { status: 500 });
  }
}
