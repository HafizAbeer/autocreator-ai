import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  topic: String,
  script: String,
  caption: String,
  hashtags: [String],
  mediaUrl: String, // Path to generated video or thumbnail
  type: {
    type: String,
    enum: ["video", "thumbnail"],
    default: "video",
  },
  platforms: [{
    platform: {
      type: String,
      enum: ["tiktok", "instagram", "facebook"],
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "processing", "published", "failed"],
      default: "draft",
    },
    scheduledFor: Date,
    publishedAt: Date,
    errorLog: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

postSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
