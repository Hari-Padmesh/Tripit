import express from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import { Friendship } from "../models/Friendship.js";
import { Message } from "../models/Message.js";

const router = express.Router();

/* --------------------------------------------------
   GET CHAT HISTORY WITH A FRIEND
-------------------------------------------------- */
router.get("/:friendId", requireAuth, async (req, res) => {
  try {
    const { friendId } = req.params;
    const { limit = 50, before } = req.query;

    // Find the friendship between the two users
    const friendship = await Friendship.findOne({
      users: { $all: [req.user.id, friendId] },
    });

    if (!friendship) {
      return res.status(404).json({ error: "Friendship not found. You can only chat with friends." });
    }

    // Build query for messages
    const query = { friendshipId: friendship._id };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // Fetch messages
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("sender", "name beyondlyId avatar");

    // Mark messages as read
    await Message.updateMany(
      {
        friendshipId: friendship._id,
        sender: friendId,
        read: false,
      },
      {
        $set: { read: true, readAt: new Date() },
      }
    );

    res.json({
      friendshipId: friendship._id,
      messages: messages.reverse(), // Return in chronological order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

/* --------------------------------------------------
   SEND MESSAGE TO A FRIEND
-------------------------------------------------- */
router.post("/:friendId", requireAuth, async (req, res) => {
  try {
    const { friendId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Message content is required" });
    }

    if (content.length > 2000) {
      return res.status(400).json({ error: "Message too long (max 2000 characters)" });
    }

    // Find the friendship between the two users
    const friendship = await Friendship.findOne({
      users: { $all: [req.user.id, friendId] },
    });

    if (!friendship) {
      return res.status(404).json({ error: "Friendship not found. You can only chat with friends." });
    }

    // Create the message
    const message = await Message.create({
      friendshipId: friendship._id,
      sender: req.user.id,
      content: content.trim(),
      read: false,
    });

    // Populate sender info
    await message.populate("sender", "name beyondlyId avatar");

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

/* --------------------------------------------------
   GET UNREAD MESSAGE COUNT
-------------------------------------------------- */
router.get("/unread/count", requireAuth, async (req, res) => {
  try {
    // Find all friendships for this user
    const friendships = await Friendship.find({ users: req.user.id });
    const friendshipIds = friendships.map((f) => f._id);

    // Count unread messages where sender is not the current user
    const unreadCount = await Message.countDocuments({
      friendshipId: { $in: friendshipIds },
      sender: { $ne: req.user.id },
      read: false,
    });

    res.json({ unreadCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get unread count" });
  }
});

/* --------------------------------------------------
   MARK MESSAGES AS READ
-------------------------------------------------- */
router.patch("/:friendId/read", requireAuth, async (req, res) => {
  try {
    const { friendId } = req.params;

    // Find the friendship
    const friendship = await Friendship.findOne({
      users: { $all: [req.user.id, friendId] },
    });

    if (!friendship) {
      return res.status(404).json({ error: "Friendship not found" });
    }

    // Mark all messages from this friend as read
    const result = await Message.updateMany(
      {
        friendshipId: friendship._id,
        sender: friendId,
        read: false,
      },
      {
        $set: { read: true, readAt: new Date() },
      }
    );

    res.json({ markedRead: result.modifiedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
});

export default router;
