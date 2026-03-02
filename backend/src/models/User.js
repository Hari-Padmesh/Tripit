import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
    },
    name: {
      type: String,
      trim: true,
    },
    googleId: {
      type: String,
      index: true,
    },
    preferredCurrency: {
      type: String,
      default: "USD",
    },
    defaultLanguage: {
      type: String,
      default: "en",
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

export const User = mongoose.model("User", userSchema);

