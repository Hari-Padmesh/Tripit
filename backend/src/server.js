import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import passport from "passport";
import { createServer } from "http";
import { Server } from "socket.io";
import authRouter from "./routes/auth.js";
import travelRouter from "./routes/travel.js";
import translateRouter from "./routes/translate.js";
import userRouter from "./routes/user.js";
import friendsRouter from "./routes/friends.js";
import chatRouter from "./routes/chat.js";
import { configureGoogleStrategy, verifyAccessToken } from "./config/auth.js";
import { setupSocketHandlers } from "./socket/index.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  },
});

configureGoogleStrategy();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Make io available to routes
app.set("io", io);

app.use("/auth", authRouter);
app.use("/travel", travelRouter);
app.use("/translate", translateRouter);
app.use("/user", userRouter);
app.use("/friends", friendsRouter);
app.use("/chat", chatRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "beyondly-backend" });
});

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

async function start() {
  if (!MONGO_URI) {
    console.error("MONGO_URI is not set in environment variables");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB Atlas");

    // Set up Socket.io handlers
    setupSocketHandlers(io, verifyAccessToken);

    httpServer.listen(PORT, () => {
      console.log(`Backend listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();

