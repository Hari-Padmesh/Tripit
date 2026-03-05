import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // Reference to the friendship (chat thread)
    friendshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Friendship",
      required: true,
      index: true,
    },
    // Sender of the message
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Message content
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    // Read status
    read: {
      type: Boolean,
      default: false,
    },
    // Read timestamp
    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index for efficient message retrieval
messageSchema.index({ friendshipId: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
