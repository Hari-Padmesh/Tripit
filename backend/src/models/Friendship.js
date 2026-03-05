import mongoose from "mongoose";

const friendshipSchema = new mongoose.Schema(
  {
    // Array of two user IDs (sorted for consistency)
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }],
    // When the friendship was established
    connectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for efficient friend lookups
friendshipSchema.index({ users: 1 });

// Static method to check if two users are friends
friendshipSchema.statics.areFriends = async function (userId1, userId2) {
  const friendship = await this.findOne({
    users: { $all: [userId1, userId2] },
  });
  return !!friendship;
};

// Static method to get all friends of a user
friendshipSchema.statics.getFriends = async function (userId) {
  const friendships = await this.find({ users: userId }).populate("users", "name email beyondlyId avatar isOnline lastSeen locationVisible");
  return friendships.map((f) => f.users.find((u) => u._id.toString() !== userId.toString()));
};

export const Friendship = mongoose.model("Friendship", friendshipSchema);
