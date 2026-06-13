export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response("url is required", { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "video/*,*/*",
        Referer: "https://www.pexels.com/",
      },
    });

    if (!response.ok) {
      return new Response("Failed to fetch video", { status: 502 });
    }

    const contentType = response.headers.get("content-type") || "video/mp4";
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response("Failed to proxy video: " + error.message, { status: 500 });
  }
}
