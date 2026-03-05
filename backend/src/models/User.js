import mongoose from "mongoose";
import crypto from "crypto";

// Generate unique Beyondly ID (e.g., "BYD-4X92K")
function generateBeyondlyId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1 for clarity
  let id = "";
  for (let i = 0; i < 5; i++) {
    id += chars[crypto.randomInt(chars.length)];
  }
  return `BYD-${id}`;
}

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
    },
    preferredCurrency: {
      type: String,
      default: "USD",
    },
    defaultLanguage: {
      type: String,
      default: "en",
    },
    // Unique shareable Beyondly ID
    beyondlyId: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Avatar URL or color for profile
    avatar: {
      type: String,
      default: "",
    },
    // Location visibility toggle
    locationVisible: {
      type: Boolean,
      default: true,
    },
    // Online status
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

userSchema.index({ googleId: 1 });
// Note: beyondlyId already has unique: true, which creates an index

// Pre-save hook to generate Beyondly ID if not present
userSchema.pre("save", async function () {
  if (!this.beyondlyId) {
    let id = generateBeyondlyId();
    let exists = await mongoose.model("User").findOne({ beyondlyId: id });
    while (exists) {
      id = generateBeyondlyId();
      exists = await mongoose.model("User").findOne({ beyondlyId: id });
    }
    this.beyondlyId = id;
  }
});

export const User = mongoose.model("User", userSchema);

