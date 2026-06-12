import { NextResponse } from "next/server";

// This is a server-side proxy for Google TTS to bypass browser CORS restrictions.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text");
  const lang = searchParams.get("lang") || "en";

  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  try {
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&total=1&idx=0&textlen=${text.length}&client=tw-ob&prev=input&ttsspeed=1`;

    const response = await fetch(ttsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://translate.google.com/",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "TTS fetch failed" }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
