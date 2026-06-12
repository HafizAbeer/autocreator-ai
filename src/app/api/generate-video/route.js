import { NextResponse } from "next/server";
import { aiService } from "@/services/ai";
import { createClient } from "pexels";

export async function POST(req) {
  try {
    const { topic, script, duration } = await req.json();

    if (!topic && !script) {
      return NextResponse.json({ error: "Topic or script is required" }, { status: 400 });
    }

    // ─── STEP 1: Use Groq to generate a JSON scene breakdown ───────────────
    const systemPrompt = `You are a professional video producer specializing in short-form vertical videos (TikTok, Instagram Reels).

Your job is to take a script or topic and divide it into scenes. CRITICAL RULES:
1. The "text" field must contain the EXACT words to be spoken in that scene — do NOT summarize or shorten. Use complete sentences from the script.
2. Each scene should be a natural spoken chunk of 1-3 sentences (roughly 10-30 words).
3. Duration = number of seconds to display this scene. Calculate it based on speaking speed (average 2.5 words per second). So 15 words = ~6 seconds.
4. "keyword" should be a 2-4 word Pexels search term that matches the scene visually.

Return ONLY a valid JSON array. No markdown, no extra text. Format:
[
  {
    "text": "exact words spoken in this scene, complete sentence",
    "keyword": "matching visual keyword",
    "duration": 6
  }
]`;

    const userPrompt = script
      ? `Divide this script into scenes following the rules above. Use the EXACT words from the script, do not paraphrase:\n\n${script}`
      : `Write a complete ${duration || "30"}-second voiceover script about "${topic}" for a TikTok-style vertical video. Then divide it into scenes. Use real, complete sentences for each scene's "text" — do not summarize.`;

    const rawJson = await aiService.generateText({ prompt: userPrompt, systemPrompt });

    // Parse the JSON from the AI response
    let scenes;
    try {
      const jsonMatch = rawJson.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON array found");
      scenes = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json(
        { error: "AI could not generate a scene breakdown. Please try again." },
        { status: 500 }
      );
    }

    // Clamp duration to reasonable range
    scenes = scenes.map((scene) => ({
      ...scene,
      duration: Math.max(3, Math.min(12, scene.duration || Math.ceil((scene.text?.split(" ").length || 10) / 2.5))),
    }));

    // ─── STEP 2: Fetch Pexels stock videos for each scene ──────────────────
    const pexelsApiKey = process.env.PEXELS_API_KEY;
    if (!pexelsApiKey || pexelsApiKey === "your_pexels_api_key_here") {
      return NextResponse.json(
        { error: "PEXELS_API_KEY is not configured in your .env.local file." },
        { status: 500 }
      );
    }
    const pexels = createClient(pexelsApiKey);

    const scenesWithMedia = await Promise.all(
      scenes.map(async (scene) => {
        try {
          const response = await pexels.videos.search({
            query: scene.keyword,
            per_page: 5,
            orientation: "portrait",
          });

          let videoUrl = null;
          if (response.videos && response.videos.length > 0) {
            const video = response.videos[0];
            const portraitHD = video.video_files.find(
              (f) => f.quality === "hd" && f.width < f.height
            );
            const anySd = video.video_files.find((f) => f.quality === "sd");
            videoUrl = (portraitHD || anySd || video.video_files[0])?.link || null;
          }

          // Use our TTS proxy (server-side fetch avoids CORS)
          const audioUrl = `/api/tts-proxy?text=${encodeURIComponent(scene.text)}&lang=en`;

          return {
            text: scene.text,
            keyword: scene.keyword,
            duration: scene.duration,
            videoUrl,
            audioUrl,
          };
        } catch {
          return {
            text: scene.text,
            keyword: scene.keyword,
            duration: scene.duration,
            videoUrl: null,
            audioUrl: null,
          };
        }
      })
    );

    return NextResponse.json({ scenes: scenesWithMedia });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to generate video" },
      { status: 500 }
    );
  }
}
