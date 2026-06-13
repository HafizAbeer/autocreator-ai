import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  niche: String,
  targetAudience: String,
  videoDuration: { type: String, default: "60" },

  // Generated content
  generatedScript: String,
  generatedCaption: String,
  generatedHashtags: [String],
  thumbnailUrl: String,
  videoScenes: [mongoose.Schema.Types.Mixed], // scenes array from generate-video

  // Pipeline tracking
  pipelineStatus: {
    type: String,
    enum: [
      "queued",
      "generating_script",
      "generating_media",
      "generating_video",
      "ready",
      "publishing",
      "published",
      "failed",
    ],
    default: "queued",
  },
  pipelineStep: { type: Number, default: 0 }, // 0-5 for progress bar
  pipelineError: String,

  // Scheduling
  scheduledFor: Date,
  postNow: { type: Boolean, default: false },

  // Per-platform publishing
  platforms: [
    {
      platform: {
        type: String,
        enum: ["tiktok", "instagram", "facebook"],
      },
      status: {
        type: String,
        enum: ["pending", "scheduled", "processing", "published", "failed"],
        default: "pending",
      },
      publishedAt: Date,
      errorLog: String,
      postId: String, // platform's returned post ID
    },
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

postSchema.pre("save", async function () {
  this.updatedAt = Date.now();
});

export const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
