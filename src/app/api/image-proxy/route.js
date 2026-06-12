export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const prompt = searchParams.get("prompt");
  const seed = searchParams.get("seed") || Math.floor(Math.random() * 99999);

  if (!prompt) {
    return new Response("prompt is required", { status: 400 });
  }

  try {
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&nologo=true&seed=${seed}`;

    const response = await fetch(pollinationsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "image/*",
      },
    });

    if (!response.ok) {
      return new Response("Image generation failed", { status: 502 });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new Response(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response("Failed to fetch image: " + error.message, { status: 500 });
  }
}
