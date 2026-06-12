import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    unique: true, // We could index by day
  },
  visitors: {
    type: Number,
    default: 0,
  },
  uniqueVisitors: {
    type: Number,
    default: 0,
  },
  generations: {
    video: { type: Number, default: 0 },
    script: { type: Number, default: 0 },
    thumbnail: { type: Number, default: 0 },
    caption: { type: Number, default: 0 },
    hashtag: { type: Number, default: 0 },
  },
  publishedPosts: {
    tiktok: { type: Number, default: 0 },
    instagram: { type: Number, default: 0 },
    facebook: { type: Number, default: 0 },

  },
});

export const Analytics = mongoose.models.Analytics || mongoose.model("Analytics", analyticsSchema);
