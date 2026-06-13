import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { aiService } from "@/services/ai";
import { createClient } from "pexels";
import { videoService } from "@/services/video";
// Helper: update pipeline status in DB
async function updateJob(jobId, fields) {
  await Post.findByIdAndUpdate(jobId, { $set: fields });
}

// Helper: generate text via AI
async function generateAI(prompt, systemPrompt) {
  return aiService.generateText({ prompt, systemPrompt });
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, niche, targetAudience, videoDuration } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    await dbConnect();

    // Create DB job immediately
    const job = await Post.create({
      topic,
      niche: niche || "General",
      targetAudience: targetAudience || "Everyone",
      videoDuration: videoDuration || "60",
      pipelineStatus: "queued",
      pipelineStep: 0,
    });

    const jobId = job._id.toString();

    // Return job ID immediately — pipeline runs in background (fire-and-forget)
    runPipeline(jobId, { topic, niche, targetAudience, videoDuration }).catch(
      async (err) => {
        await updateJob(jobId, {
          pipelineStatus: "failed",
          pipelineError: err.message,
        });
      }
    );

    return NextResponse.json({ jobId, message: "Pipeline started." });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function runPipeline(jobId, { topic, niche, targetAudience, videoDuration }) {
  // ── STEP 1: Generate Script ─────────────────────────────────────
  await updateJob(jobId, { pipelineStatus: "generating_script", pipelineStep: 1 });

  const scriptPrompt = `Write a ${videoDuration || "60"}-second script about "${topic}".
Niche: ${niche || "General"}
Target Audience: ${targetAudience || "Everyone"}

Format:
- Hook (first 3 seconds)
- Intro
- Main Body (with visual cues in brackets like [Show text on screen: ...])
- Call to Action (CTA)

Provide ONLY the script text, no extra commentary.`;

  const generatedScript = await generateAI(scriptPrompt, `You are an expert viral short-form content scriptwriter for TikTok, Instagram Reels, and Facebook Reels.`);

  await updateJob(jobId, { generatedScript, pipelineStep: 2 });

  // ── STEP 2: Generate Caption + Hashtags (parallel) ─────────────
  await updateJob(jobId, { pipelineStatus: "generating_media", pipelineStep: 2 });

  const [captionRaw, hashtagRaw] = await Promise.all([
    generateAI(
      `Write a compelling social media caption for a video about "${topic}" in the ${niche || "General"} niche. Include a strong hook and call to action. Keep it under 150 words.`,
      "You are a professional social media caption writer."
    ),
    generateAI(
      `Generate 20 highly relevant hashtags for a video about "${topic}" in the ${niche || "General"} niche. Mix trending, niche-specific, and broad hashtags. Return ONLY the hashtags separated by spaces, no explanation.`,
      "You are a social media hashtag expert."
    ),
  ]);

  const generatedHashtags = hashtagRaw
    .split(/\s+/)
    .filter((h) => h.startsWith("#"))
    .slice(0, 20);

  await updateJob(jobId, { generatedCaption: captionRaw, generatedHashtags, pipelineStep: 3 });

  // ── STEP 3: Generate Video Scenes ───────────────────────────────
  await updateJob(jobId, { pipelineStatus: "generating_video", pipelineStep: 3 });

  const sceneSystemPrompt = `You are a professional video producer for short-form vertical videos (TikTok, Instagram Reels).
Divide a script into scenes. RULES:
1. "text" = EXACT words spoken in that scene (complete sentences, do NOT summarize)
2. Each scene = 1-3 natural spoken sentences (~10-30 words)
3. "duration" = seconds based on speaking speed (2.5 words/sec). 15 words = ~6 seconds
4. "keyword" = 2-4 word Pexels search term matching the scene visually
Return ONLY a valid JSON array. No markdown, no extra text. Format:
[{ "text": "...", "keyword": "...", "duration": 6 }]`;

  const rawJson = await generateAI(
    `Divide this script into scenes. Use EXACT words:\n\n${generatedScript}`,
    sceneSystemPrompt
  );

  let scenes = [];
  try {
    const match = rawJson.match(/\[[\s\S]*\]/);
    if (match) {
      scenes = JSON.parse(match[0]);
      scenes = scenes.map((s) => ({
        ...s,
        duration: Math.max(3, Math.min(12, s.duration || Math.ceil((s.text?.split(" ").length || 10) / 2.5))),
      }));
    }
  } catch {
    // Scene parsing failed — store empty, continue
  }

  await updateJob(jobId, { pipelineStep: 4 });

  // Fetch Pexels stock videos for each scene
  const pexels = createClient(process.env.PEXELS_API_KEY);
  const videoScenes = await Promise.all(
    scenes.map(async (scene) => {
      try {
        const res = await pexels.videos.search({ query: scene.keyword, per_page: 3, orientation: "portrait" });
        let videoUrl = null;
        if (res.videos?.length > 0) {
          const v = res.videos[0];
          const hd = v.video_files.find((f) => f.quality === "hd" && f.width < f.height);
          const sd = v.video_files.find((f) => f.quality === "sd");
          videoUrl = (hd || sd || v.video_files[0])?.link || null;
        }
        const audioUrl = `/api/tts-proxy?text=${encodeURIComponent(scene.text)}&lang=en`;
        return { ...scene, videoUrl, audioUrl };
      } catch {
        return { ...scene, videoUrl: null, audioUrl: null };
      }
    })
  );

  await updateJob(jobId, { videoScenes, pipelineStep: 5 });

  // ── STEP 4: Stitch Video ────────────────────────────────────────
  await updateJob(jobId, { pipelineStatus: "stitching_video", pipelineStep: 4 });

  try {
    const finalVideoUrl = await videoService.stitchVideo(jobId, videoScenes);
    await updateJob(jobId, { pipelineStatus: "ready", pipelineStep: 5, finalVideoUrl });
  } catch (err) {
    console.error("Video Stitching Failed:", err);
    await updateJob(jobId, { pipelineStatus: "failed", pipelineError: "Video Stitching Failed: " + err.message, pipelineStep: 5 });
  }

  // NOTE: Actual social media posting will be triggered separately
  // once the user reviews the content or if postNow=true and tokens exist.
}
