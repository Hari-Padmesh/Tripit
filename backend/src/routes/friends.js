import express from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { FriendRequest } from "../models/FriendRequest.js";
import { Friendship } from "../models/Friendship.js";
import { UserLocation } from "../models/UserLocation.js";
import { connectedUsers } from "../socket/index.js";
import { geocodeCity } from "../utils/geocoding.js";

const router = express.Router();

/* --------------------------------------------------
   SEND FRIEND REQUEST (by Beyondly ID)
-------------------------------------------------- */
router.post("/add", requireAuth, async (req, res) => {
  try {
    const { beyondlyId } = req.body;
    
    if (!beyondlyId) {
      return res.status(400).json({ error: "Beyondly ID is required" });
    }

    // Find the target user by Beyondly ID
    const targetUser = await User.findOne({ beyondlyId: beyondlyId.toUpperCase() });
    if (!targetUser) {
      return res.status(404).json({ error: "User not found with this Beyondly ID" });
    }

    // Can't add yourself
    if (targetUser._id.toString() === req.user.id) {
      return res.status(400).json({ error: "You cannot add yourself as a friend" });
    }

    // Check if already friends
    const existingFriendship = await Friendship.findOne({
      users: { $all: [req.user.id, targetUser._id] },
    });
    if (existingFriendship) {
      return res.status(400).json({ error: "You are already friends with this user" });
    }

    // Check for existing pending request (either direction)
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { from: req.user.id, to: targetUser._id, status: "pending" },
        { from: targetUser._id, to: req.user.id, status: "pending" },
      ],
    });
    if (existingRequest) {
      // If they sent you a request, auto-accept it
      if (existingRequest.from.toString() === targetUser._id.toString()) {
        existingRequest.status = "accepted";
        await existingRequest.save();

        // Create friendship
        await Friendship.create({
          users: [req.user.id, targetUser._id],
        });

        return res.json({ message: "Friend request accepted! You are now friends.", accepted: true });
      }
      return res.status(400).json({ error: "Friend request already sent" });
    }

    // Create new friend request
    const friendRequest = await FriendRequest.create({
      from: req.user.id,
      to: targetUser._id,
      status: "pending",
    });

    // Get sender info for real-time notification
    const sender = await User.findById(req.user.id).select("name email beyondlyId avatar");

    // Emit socket event to target user if online
    const io = req.app.get("io");
    const targetSocketId = connectedUsers.get(targetUser._id.toString());
    if (io && targetSocketId) {
      io.to(targetSocketId).emit("friend:request", {
        _id: friendRequest._id,
        from: sender,
        status: "pending",
        createdAt: friendRequest.createdAt,
      });
    }

    res.status(201).json({ 
      message: "Friend request sent!",
      request: friendRequest,
      targetUser: { name: targetUser.name, beyondlyId: targetUser.beyondlyId }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send friend request" });
  }
});

/* --------------------------------------------------
   GET PENDING FRIEND REQUESTS (received)
-------------------------------------------------- */
router.get("/requests", requireAuth, async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      to: req.user.id,
      status: "pending",
    }).populate("from", "name email beyondlyId avatar");

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch friend requests" });
  }
});

/* --------------------------------------------------
   GET SENT FRIEND REQUESTS
-------------------------------------------------- */
router.get("/requests/sent", requireAuth, async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      from: req.user.id,
      status: "pending",
    }).populate("to", "name email beyondlyId avatar");

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sent requests" });
  }
});

/* --------------------------------------------------
   ACCEPT FRIEND REQUEST
-------------------------------------------------- */
router.patch("/accept/:requestId", requireAuth, async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await FriendRequest.findOne({
      _id: requestId,
      to: req.user.id,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    // Update request status
    request.status = "accepted";
    await request.save();

    // Create friendship
    const friendship = await Friendship.create({
      users: [request.from, request.to],
    });

    // Populate friend info for response
    const friend = await User.findById(request.from).select("name email beyondlyId avatar");

    res.json({ 
      message: "Friend request accepted!",
      friendship,
      friend 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to accept friend request" });
  }
});

/* --------------------------------------------------
   REJECT FRIEND REQUEST
-------------------------------------------------- */
router.patch("/reject/:requestId", requireAuth, async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await FriendRequest.findOneAndUpdate(
      { _id: requestId, to: req.user.id, status: "pending" },
      { status: "rejected" },
      { returnDocument: 'after' }
    );

    if (!request) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    res.json({ message: "Friend request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reject friend request" });
  }
});

/* --------------------------------------------------
   GET ALL FRIENDS
-------------------------------------------------- */
router.get("/", requireAuth, async (req, res) => {
  try {
    const friendships = await Friendship.find({
      users: req.user.id,
    }).populate("users", "name email beyondlyId avatar isOnline lastSeen locationVisible");

    // Extract friend info (the other user in each friendship)
    const friends = await Promise.all(
      friendships.map(async (f) => {
        const friend = f.users.find((u) => u._id.toString() !== req.user.id);
        
        // Get friend's location if visible
        let location = null;
        if (friend.locationVisible) {
          location = await UserLocation.findOne({ userId: friend._id });
          
          // If location has city but no valid coordinates, try geocoding
          if (location && location.city && 
              (!location.coordinates || (location.coordinates.lat === 0 && location.coordinates.lng === 0))) {
            const geocoded = await geocodeCity(location.city, location.country);
            if (geocoded) {
              // Update the database with geocoded coordinates
              await UserLocation.findByIdAndUpdate(location._id, {
                $set: { coordinates: geocoded, source: 'geocoded' }
              });
              location.coordinates = geocoded;
            }
          }
        }

        return {
          friendshipId: f._id,
          connectedAt: f.connectedAt,
          user: {
            _id: friend._id,
            name: friend.name,
            email: friend.email,
            beyondlyId: friend.beyondlyId,
            avatar: friend.avatar,
            isOnline: friend.isOnline,
            lastSeen: friend.lastSeen,
            locationVisible: friend.locationVisible,
          },
          location: location ? {
            city: location.city,
            country: location.country,
            coordinates: location.coordinates,
          } : null,
        };
      })
    );

    res.json(friends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch friends" });
  }
});

/* --------------------------------------------------
   REMOVE FRIEND
-------------------------------------------------- */
router.delete("/:friendshipId", requireAuth, async (req, res) => {
  try {
    const { friendshipId } = req.params;

    const friendship = await Friendship.findOneAndDelete({
      _id: friendshipId,
      users: req.user.id,
    });

    if (!friendship) {
      return res.status(404).json({ error: "Friendship not found" });
    }

    res.json({ message: "Friend removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove friend" });
  }
});

export default router;
