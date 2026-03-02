import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import passport from "passport";
import authRouter from "./routes/auth.js";
import travelRouter from "./routes/travel.js";
import translateRouter from "./routes/translate.js";
import { configureGoogleStrategy } from "./config/auth.js";

dotenv.config();

const app = express();

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

app.use("/auth", authRouter);
app.use("/travel", travelRouter);
app.use("/translate", translateRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "beyondly-backend" });
});

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

async function start() {
  if (!MONGO_URI) {
    // eslint-disable-next-line no-console
    console.error("MONGO_URI is not set in environment variables");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    // eslint-disable-next-line no-console
    console.log("Connected to MongoDB Atlas");

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend listening on port ${PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();

