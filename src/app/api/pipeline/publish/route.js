import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { User } from "@/models/User";
import { postInstagramReel } from "@/services/social/meta";
import { postFacebookVideo } from "@/services/social/meta";
import { postTikTokVideo } from "@/services/social/tiktok";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await req.json();
    if (!jobId) return NextResponse.json({ error: "jobId is required" }, { status: 400 });

    await dbConnect();

    // Load job
    const job = await Post.findById(jobId);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    if (!["ready", "failed"].includes(job.pipelineStatus)) {
      return NextResponse.json({ error: "Job is not ready for publishing." }, { status: 400 });
    }

    // Load admin's social tokens
    const user = await User.findOne({ email: session.user.email }).lean();
    const tokens = user?.socialAccounts || {};

    // Build caption: generated caption + hashtags
    const hashtags = (job.generatedHashtags || []).join(" ");
    const fullCaption = `${job.generatedCaption || job.topic}\n\n${hashtags}`.trim();

    // Pick best video URL from first scene that has one
    const videoUrl = job.videoScenes?.find((s) => s.videoUrl)?.videoUrl || null;

    if (!videoUrl) {
      return NextResponse.json(
        { error: "No video URL available in this job's scenes. Please regenerate the pipeline." },
        { status: 400 }
      );
    }

    // Update job status
    job.pipelineStatus = "publishing";
    await job.save();

    const results = [];
    const platformUpdates = [];

    // ── Publish to each selected platform ────────────────────────────────────
    for (const platformEntry of job.platforms) {
      const { platform } = platformEntry;
      const platformIdx = job.platforms.findIndex((p) => p.platform === platform);

      try {
        let postId = null;

        if (platform === "instagram") {
          if (!tokens.instagram?.accessToken) {
            throw new Error("Instagram not connected. Go to Social Accounts to connect.");
          }
          const result = await postInstagramReel(
            tokens.instagram.accessToken,
            tokens.instagram.accountId,
            videoUrl,
            fullCaption
          );
          postId = result.postId;
        }

        else if (platform === "facebook") {
          if (!tokens.facebook?.accessToken) {
            throw new Error("Facebook not connected. Go to Social Accounts to connect.");
          }
          const result = await postFacebookVideo(
            tokens.facebook.accessToken,
            tokens.facebook.accountId,
            videoUrl,
            fullCaption
          );
          postId = result.postId;
        }

        else if (platform === "tiktok") {
          if (!tokens.tiktok?.accessToken) {
            throw new Error("TikTok not connected. Go to Social Accounts to connect.");
          }
          const result = await postTikTokVideo(
            tokens.tiktok.accessToken,
            videoUrl,
            fullCaption.slice(0, 150)
          );
          postId = result.publishId;
        }

        job.platforms[platformIdx].status = "published";
        job.platforms[platformIdx].publishedAt = new Date();
        job.platforms[platformIdx].postId = postId;
        results.push({ platform, success: true, postId });

      } catch (err) {
        job.platforms[platformIdx].status = "failed";
        job.platforms[platformIdx].errorLog = err.message;
        results.push({ platform, success: false, error: err.message });
      }

      platformUpdates.push(job.platforms[platformIdx]);
    }

    // Determine overall status — keep "ready" if any platform failed (allows retry)
    const anyPublished = job.platforms.some((p) => p.status === "published");
    const allFailed = job.platforms.every((p) => p.status === "failed");
    job.pipelineStatus = anyPublished ? "published" : allFailed ? "ready" : "published";
    await job.save();

    return NextResponse.json({
      success: true,
      results,
      pipelineStatus: job.pipelineStatus,
    });

  } catch (error) {
    console.error("Publish error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
