import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { Post } from "@/models/Post";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;
    await dbConnect();

    const job = await Post.findById(jobId).lean();
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    return NextResponse.json({
      jobId: job._id,
      topic: job.topic,
      pipelineStatus: job.pipelineStatus,
      pipelineStep: job.pipelineStep,
      pipelineError: job.pipelineError,
      hasScript: !!job.generatedScript,
      hasCaption: !!job.generatedCaption,
      hasHashtags: job.generatedHashtags?.length > 0,
      hasVideoScenes: job.videoScenes?.length > 0,
      platforms: job.platforms,
      scheduledFor: job.scheduledFor,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
