/**
 * TikTok Social Media Service
 * Handles posting videos to TikTok using the Content Posting API v2.
 *
 * Docs: https://developers.tiktok.com/doc/content-posting-api-get-started
 *
 * Flow:
 *  1. POST /v2/post/publish/video/init/  → get upload_url + publish_id
 *  2. PUT to upload_url with video binary
 *  3. GET /v2/post/publish/status/fetch/ → poll until success
 */

const TIKTOK_BASE = "https://open.tiktokapis.com/v2";

/**
 * Post a video to TikTok via URL (PULL_FROM_URL method).
 * @param {string} accessToken  - TikTok user access token
 * @param {string} videoUrl     - Publicly accessible video URL
 * @param {string} title        - Video title/caption (max 150 chars)
 * @param {Object} options      - Additional options
 * @returns {{ publishId: string }}
 */
export async function postTikTokVideo(accessToken, videoUrl, title, options = {}) {
  const {
    privacyLevel = "PUBLIC_TO_EVERYONE",
    disableDuet = false,
    disableComment = false,
    disableStitch = false,
  } = options;

  // Step 1: Initialize the post
  const initRes = await fetch(`${TIKTOK_BASE}/post/publish/video/init/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      post_info: {
        title: title.slice(0, 150),
        privacy_level: privacyLevel,
        disable_duet: disableDuet,
        disable_comment: disableComment,
        disable_stitch: disableStitch,
      },
      source_info: {
        source: "PULL_FROM_URL",
        video_url: videoUrl,
      },
    }),
  });

  const initData = await initRes.json();

  if (!initRes.ok || initData.error?.code !== "ok") {
    throw new Error(
      `TikTok init error: ${initData.error?.message || initData.error?.code || initRes.status}`
    );
  }

  const publishId = initData.data?.publish_id;
  if (!publishId) throw new Error("TikTok did not return a publish_id.");

  // Step 2: Poll for publishing status
  await waitForTikTokPublish(accessToken, publishId);

  return { publishId };
}

async function waitForTikTokPublish(accessToken, publishId, maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(6000); // wait 6 seconds between polls

    const statusRes = await fetch(`${TIKTOK_BASE}/post/publish/status/fetch/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ publish_id: publishId }),
    });

    const statusData = await statusRes.json();
    const status = statusData.data?.status;

    if (status === "PUBLISH_COMPLETE") return;
    if (status === "FAILED") {
      throw new Error(`TikTok publishing failed: ${statusData.data?.fail_reason || "Unknown reason"}`);
    }
    // PROCESSING_UPLOAD, PROCESSING_DOWNLOAD, SENDING_TO_USER_INBOX — keep polling
  }
  throw new Error("TikTok publishing timed out after polling.");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
