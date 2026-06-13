/**
 * Meta Social Media Service
 * Handles posting to both Instagram (Reels) and Facebook (Videos)
 * using the Meta Graph API.
 *
 * Docs:
 *  - Instagram: https://developers.facebook.com/docs/instagram-api/guides/reels
 *  - Facebook:  https://developers.facebook.com/docs/video-api
 */

const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

// ── Instagram ─────────────────────────────────────────────────────────────────

/**
 * Post a Reel to Instagram.
 * @param {string} accessToken - User's Instagram access token
 * @param {string} igUserId    - Instagram User ID (accountId stored in DB)
 * @param {string} videoUrl    - Publicly accessible video URL (MP4)
 * @param {string} caption     - Post caption including hashtags
 * @returns {{ postId: string }}
 */
export async function postInstagramReel(accessToken, igUserId, videoUrl, caption) {
  // Step 1: Create media container
  const containerRes = await fetch(
    `${GRAPH_BASE}/${igUserId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_type: "REELS",
        video_url: videoUrl,
        caption,
        share_to_feed: true,
        access_token: accessToken,
      }),
    }
  );
  const container = await containerRes.json();
  if (!containerRes.ok || container.error) {
    throw new Error(`Instagram container error: ${container.error?.message || containerRes.status}`);
  }

  const containerId = container.id;

  // Step 2: Poll until container is FINISHED (video processing)
  await waitForInstagramContainer(containerId, accessToken);

  // Step 3: Publish the container
  const publishRes = await fetch(
    `${GRAPH_BASE}/${igUserId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: accessToken,
      }),
    }
  );
  const published = await publishRes.json();
  if (!publishRes.ok || published.error) {
    throw new Error(`Instagram publish error: ${published.error?.message || publishRes.status}`);
  }

  return { postId: published.id };
}

async function waitForInstagramContainer(containerId, accessToken, maxAttempts = 15) {
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(5000); // wait 5 seconds between polls
    const res = await fetch(
      `${GRAPH_BASE}/${containerId}?fields=status_code,status&access_token=${accessToken}`
    );
    const data = await res.json();
    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR" || data.status_code === "EXPIRED") {
      throw new Error(`Instagram video processing failed: ${data.status_code}`);
    }
  }
  throw new Error("Instagram video processing timed out.");
}

// ── Facebook ──────────────────────────────────────────────────────────────────

/**
 * Post a video/Reel to a Facebook Page.
 * @param {string} accessToken - Page access token
 * @param {string} pageId      - Facebook Page ID (accountId stored in DB)
 * @param {string} videoUrl    - Publicly accessible video URL (MP4)
 * @param {string} description - Post description/caption
 * @returns {{ postId: string }}
 */
export async function postFacebookVideo(accessToken, pageId, videoUrl, description) {
  const res = await fetch(
    `${GRAPH_BASE}/${pageId}/videos`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file_url: videoUrl,
        description,
        access_token: accessToken,
      }),
    }
  );
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(`Facebook post error: ${data.error?.message || res.status}`);
  }
  return { postId: data.id };
}

// ── Utility ───────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
