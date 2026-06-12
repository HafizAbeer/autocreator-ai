import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  socialAccounts: {
    tiktok: { accessToken: String, refreshToken: String, accountId: String },
    instagram: { accessToken: String, refreshToken: String, accountId: String },
    facebook: { accessToken: String, refreshToken: String, accountId: String },

  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
