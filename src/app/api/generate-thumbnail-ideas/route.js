import { NextResponse } from "next/server";
import { aiService } from "@/services/ai";
import { createClient } from "pexels";

export async function POST(req) {
  try {
    const { videoTitle, niche, style } = await req.json();

    if (!videoTitle) {
      return NextResponse.json({ error: "Video title is required" }, { status: 400 });
    }

    const pexelsApiKey = process.env.PEXELS_API_KEY;
    if (!pexelsApiKey || pexelsApiKey === "your_pexels_api_key_here") {
      return NextResponse.json({ error: "PEXELS_API_KEY is not configured." }, { status: 500 });
    }
    const pexels = createClient(pexelsApiKey);

    // ── Step 1: Ask AI for 3 search keywords and overlay text ──
    const systemPrompt = `You are a thumbnail designer. For the given video title, generate 3 thumbnail concepts.
Return EXACTLY 3 lines in this format (nothing else):
CONCEPT1: keyword="search term for stock photo" overlay="BOLD TEXT" emotion="Emotion"
CONCEPT2: keyword="search term for stock photo" overlay="BOLD TEXT" emotion="Emotion"
CONCEPT3: keyword="search term for stock photo" overlay="BOLD TEXT" emotion="Emotion"

Rules:
- keyword: 2-3 words for a Pexels photo search (e.g. "city night lights", "technology laptop", "money cash")
- overlay: 2-5 uppercase words (no quotes inside)
- emotion: one word`;

    const prompt = `Video Title: "${videoTitle}"\nNiche: ${niche || "General"}\nStyle: ${style || "Viral"}`;

    const rawResponse = await aiService.generateText({ prompt, systemPrompt });

    // ── Step 2: Parse the 3 lines ──
    const conceptLines = rawResponse
      .split("\n")
      .filter((l) => /CONCEPT\d:/i.test(l))
      .slice(0, 3);

    // Fallback concepts if AI doesn't cooperate
    const fallbackConcepts = [
      { keyword: niche || videoTitle.split(" ").slice(0, 2).join(" "), overlay: "WATCH THIS NOW", emotion: "Shock" },
      { keyword: videoTitle.split(" ").slice(0, 2).join(" "), overlay: "YOU NEED THIS", emotion: "Curiosity" },
      { keyword: niche || "success motivation", overlay: "GAME CHANGER", emotion: "Hype" },
    ];

    const parsed = [0, 1, 2].map((i) => {
      if (!conceptLines[i]) return fallbackConcepts[i];
      try {
        const keywordMatch = conceptLines[i].match(/keyword="([^"]+)"/);
        const overlayMatch = conceptLines[i].match(/overlay="([^"]+)"/);
        const emotionMatch = conceptLines[i].match(/emotion="([^"]+)"/);
        return {
          keyword: keywordMatch?.[1] || fallbackConcepts[i].keyword,
          overlay: overlayMatch?.[1] || fallbackConcepts[i].overlay,
          emotion: emotionMatch?.[1] || fallbackConcepts[i].emotion,
        };
      } catch {
        return fallbackConcepts[i];
      }
    });

    const styleNames = ["Bold & Dramatic", "Clean & Minimal", "Curiosity Hook"];

    // ── Step 3: Fetch Pexels photos for each concept ──
    const concepts = await Promise.all(
      parsed.map(async (concept, i) => {
        try {
          const res = await pexels.photos.search({
            query: concept.keyword,
            per_page: 5,
            orientation: "landscape",
          });

          let photoUrl = null;
          if (res.photos && res.photos.length > 0) {
            photoUrl = res.photos[0].src.large2x || res.photos[0].src.large;
          }

          return {
            title: styleNames[i],
            overlayText: concept.overlay,
            emotion: concept.emotion,
            keyword: concept.keyword,
            photoUrl, // Pexels direct URL — works in browser
          };
        } catch {
          return {
            title: styleNames[i],
            overlayText: concept.overlay,
            emotion: concept.emotion,
            keyword: concept.keyword,
            photoUrl: null,
          };
        }
      })
    );

    return NextResponse.json({ concepts });
  } catch (error) {
    console.error("Thumbnail error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate thumbnails" }, { status: 500 });
  }
}
