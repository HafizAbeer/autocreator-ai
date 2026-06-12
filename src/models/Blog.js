import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String, // HTML or Markdown content
    required: true,
  },
  excerpt: String,
  featuredImage: String,
  categories: [String],
  tags: [String],
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  seo: {
    title: String,
    description: String,
    keywords: [String],
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  publishedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

blogSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);
