import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { Analytics } from "@/models/Analytics";
import { Post } from "@/models/Post";
import { Blog } from "@/models/Blog";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // --- Stat Cards ---
    // Total scripts, videos, thumbnails, captions from all analytics docs
    const allAnalytics = await Analytics.find({}).lean();

    const totalVideos = allAnalytics.reduce((sum, a) => sum + (a.generations?.video || 0), 0);
    const totalScripts = allAnalytics.reduce((sum, a) => sum + (a.generations?.script || 0), 0);
    const totalThumbnails = allAnalytics.reduce((sum, a) => sum + (a.generations?.thumbnail || 0), 0);
    const totalVisitors = allAnalytics.reduce((sum, a) => sum + (a.visitors || 0), 0);

    // --- Blog Stats ---
    const totalBlogs = await Blog.countDocuments({ isPublished: true });

    // --- Chart: last 7 days analytics ---
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentAnalytics = await Analytics.find({
      date: { $gte: sevenDaysAgo },
    }).sort({ date: 1 }).lean();

    // Build a complete 7-day chart with zero-fill for missing days
    const chartData = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const found = recentAnalytics.find((a) => {
        const aDate = new Date(a.date);
        aDate.setHours(0, 0, 0, 0);
        return aDate.getTime() === d.getTime();
      });

      chartData.push({
        name: dayNames[d.getDay()],
        visitors: found?.visitors || 0,
        generations: found
          ? (found.generations?.video || 0) +
            (found.generations?.script || 0) +
            (found.generations?.thumbnail || 0) +
            (found.generations?.caption || 0) +
            (found.generations?.hashtag || 0)
          : 0,
      });
    }

    // --- Recent Posts from Automation Pipeline ---
    const recentPosts = await Post.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const pipeline = recentPosts.flatMap((post) =>
      (post.platforms || []).map((p) => ({
        title: post.topic || "Untitled Post",
        platform: p.platform,
        status: p.status,
        time: post.createdAt,
      }))
    ).slice(0, 5);

    return NextResponse.json({
      stats: {
        totalVisitors,
        totalVideos,
        totalScripts,
        totalThumbnails,
        totalBlogs,
      },
      chartData,
      pipeline,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
