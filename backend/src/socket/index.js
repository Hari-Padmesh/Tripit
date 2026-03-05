import { User } from "../models/User.js";
import { Friendship } from "../models/Friendship.js";
import { Message } from "../models/Message.js";
import { UserLocation } from "../models/UserLocation.js";

// Store connected users: userId -> socketId
const connectedUsers = new Map();

export function setupSocketHandlers(io, verifyAccessToken) {
  // Authentication middleware for Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const payload = verifyAccessToken(token);
      socket.userId = payload.sub;
      socket.userEmail = payload.email;
      next();
    } catch (err) {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.userId;
    console.log(`User connected: ${userId}`);

    // Store socket connection
    connectedUsers.set(userId, socket.id);

    // Update user online status
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });

    // Join a room for this user (for direct messages)
    socket.join(`user:${userId}`);

    // Notify friends that user is online
    await notifyFriendsStatus(io, userId, true);

    // ========================
    // CHAT EVENTS
    // ========================

    // Send message
    socket.on("chat:send", async (data) => {
      try {
        const { friendId, content } = data;

        // Verify friendship
        const friendship = await Friendship.findOne({
          users: { $all: [userId, friendId] },
        });

        if (!friendship) {
          socket.emit("chat:error", { error: "Not friends with this user" });
          return;
        }

        // Create message
        const message = await Message.create({
          friendshipId: friendship._id,
          sender: userId,
          content: content.trim(),
          read: false,
        });

        await message.populate("sender", "name beyondlyId avatar");

        // Send to sender (confirmation)
        socket.emit("chat:sent", message);

        // Send to recipient if online
        const recipientSocketId = connectedUsers.get(friendId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("chat:receive", message);
        }
      } catch (err) {
        console.error("chat:send error:", err);
        socket.emit("chat:error", { error: "Failed to send message" });
      }
    });

    // Mark messages as read
    socket.on("chat:read", async (data) => {
      try {
        const { friendId } = data;

        const friendship = await Friendship.findOne({
          users: { $all: [userId, friendId] },
        });

        if (!friendship) return;

        await Message.updateMany(
          { friendshipId: friendship._id, sender: friendId, read: false },
          { $set: { read: true, readAt: new Date() } }
        );

        // Notify sender that messages were read
        const senderSocketId = connectedUsers.get(friendId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("chat:messages_read", { by: userId });
        }
      } catch (err) {
        console.error("chat:read error:", err);
      }
    });

    // Typing indicator
    socket.on("chat:typing", (data) => {
      const { friendId, isTyping } = data;
      const recipientSocketId = connectedUsers.get(friendId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("chat:typing", { userId, isTyping });
      }
    });

    // ========================
    // LOCATION EVENTS
    // ========================

    // Update location
    socket.on("location:update", async (data) => {
      try {
        const { city, country, lat, lng, source } = data;

        // Check if user wants to be visible
        const user = await User.findById(userId);
        if (!user.locationVisible) return;

        // Update location in database
        const location = await UserLocation.findOneAndUpdate(
          { userId },
          {
            $set: {
              city: city || "",
              country: country || "",
              coordinates: { lat: lat || 0, lng: lng || 0 },
              source: source || "manual",
              updatedAt: new Date(),
            },
          },
          { upsert: true, new: true }
        );

        // Broadcast to friends
        await broadcastLocationToFriends(io, userId, location, user);
      } catch (err) {
        console.error("location:update error:", err);
      }
    });

    // Request friends' locations
    socket.on("location:request_friends", async () => {
      try {
        const friendsLocations = await getFriendsLocations(userId);
        socket.emit("location:friends", friendsLocations);
      } catch (err) {
        console.error("location:request_friends error:", err);
      }
    });

    // ========================
    // FRIEND REQUEST EVENTS
    // ========================

    socket.on("friend:request_sent", async (data) => {
      const { toUserId } = data;
      const recipientSocketId = connectedUsers.get(toUserId);
      if (recipientSocketId) {
        const sender = await User.findById(userId).select("name beyondlyId avatar");
        io.to(recipientSocketId).emit("friend:request_received", { from: sender });
      }
    });

    socket.on("friend:accepted", async (data) => {
      const { friendId } = data;
      const friendSocketId = connectedUsers.get(friendId);
      if (friendSocketId) {
        const accepter = await User.findById(userId).select("name beyondlyId avatar");
        io.to(friendSocketId).emit("friend:request_accepted", { by: accepter });
      }
    });

    // ========================
    // DISCONNECT
    // ========================

    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${userId}`);
      connectedUsers.delete(userId);

      // Update user offline status
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });

      // Notify friends that user is offline
      await notifyFriendsStatus(io, userId, false);
    });
  });
}

// Helper: Notify friends of online/offline status
async function notifyFriendsStatus(io, userId, isOnline) {
  try {
    const friendships = await Friendship.find({ users: userId });
    const user = await User.findById(userId).select("name beyondlyId avatar");

    for (const friendship of friendships) {
      const friendId = friendship.users.find((u) => u.toString() !== userId);
      const friendSocketId = connectedUsers.get(friendId?.toString());
      if (friendSocketId) {
        io.to(friendSocketId).emit("friend:status_change", {
          userId,
          isOnline,
          user: { name: user.name, beyondlyId: user.beyondlyId, avatar: user.avatar },
        });
      }
    }
  } catch (err) {
    console.error("notifyFriendsStatus error:", err);
  }
}

// Helper: Broadcast location to friends
async function broadcastLocationToFriends(io, userId, location, user) {
  try {
    const friendships = await Friendship.find({ users: userId });

    const locationData = {
      userId,
      user: { name: user.name, beyondlyId: user.beyondlyId, avatar: user.avatar },
      location: {
        city: location.city,
        country: location.country,
        coordinates: location.coordinates,
      },
    };

    for (const friendship of friendships) {
      const friendId = friendship.users.find((u) => u.toString() !== userId);
      const friendSocketId = connectedUsers.get(friendId?.toString());
      if (friendSocketId) {
        io.to(friendSocketId).emit("location:friend_update", locationData);
      }
    }
  } catch (err) {
    console.error("broadcastLocationToFriends error:", err);
  }
}

// Helper: Get all friends' locations
async function getFriendsLocations(userId) {
  try {
    const friendships = await Friendship.find({ users: userId }).populate(
      "users",
      "name beyondlyId avatar isOnline locationVisible"
    );

    const locations = [];

    for (const friendship of friendships) {
      const friend = friendship.users.find((u) => u._id.toString() !== userId);
      if (!friend || !friend.locationVisible) continue;

      const location = await UserLocation.findOne({ userId: friend._id });
      if (location) {
        locations.push({
          userId: friend._id,
          user: { name: friend.name, beyondlyId: friend.beyondlyId, avatar: friend.avatar, isOnline: friend.isOnline },
          location: {
            city: location.city,
            country: location.country,
            coordinates: location.coordinates,
          },
        });
      }
    }

    return locations;
  } catch (err) {
    console.error("getFriendsLocations error:", err);
    return [];
  }
}

// Export connectedUsers for use in routes if needed
export { connectedUsers };
