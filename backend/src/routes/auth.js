import express from "express";
import bcrypt from "bcrypt";
import Joi from "joi";
import passport from "passport";
import { User } from "../models/User.js";
import { Session } from "../models/Session.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} from "../config/auth.js";

const router = express.Router();

// Middleware to authenticate access token
function authenticateAccessToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
}

// Get current user info
router.get("/me", authenticateAccessToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ id: user.id, email: user.email, name: user.name, preferredCurrency: user.preferredCurrency });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user info" });
  }
});

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(1).max(100).required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must include lowercase, uppercase, number and special character.",
    }),
  preferredCurrency: Joi.string().length(3).default("USD"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

async function createSessionAndTokens(userId, email) {
  const accessToken = signAccessToken({ sub: userId, email });
  const refreshToken = signRefreshToken({ sub: userId, email });

  const decoded = verifyRefreshToken(refreshToken);
  const expiresAt = new Date(decoded.exp * 1000);

  await Session.findOneAndUpdate(
    { userId, refreshToken },
    { userId, refreshToken, expiresAt },
    { upsert: true, returnDocument: 'after' },
  );

  return { accessToken, refreshToken, expiresAt };
}

router.post("/signup", async (req, res) => {
  try {
    const { value, error } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const existing = await User.findOne({ email: value.email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(value.password, 10);

    const user = await User.create({
      email: value.email,
      name: value.name,
      passwordHash,
      preferredCurrency: value.preferredCurrency || "USD",
    });

    const { accessToken, refreshToken, expiresAt } = await createSessionAndTokens(
      user.id,
      user.email,
    );

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: expiresAt,
      })
      .status(201)
      .json({
        user: { id: user.id, email: user.email, name: user.name, preferredCurrency: user.preferredCurrency },
        accessToken,
      });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Failed to sign up" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { value, error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const user = await User.findOne({ email: value.email });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(value.password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { accessToken, refreshToken, expiresAt } = await createSessionAndTokens(
      user.id,
      user.email,
    );

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: expiresAt,
      })
      .json({
        user: { id: user.id, email: user.email, name: user.name, preferredCurrency: user.preferredCurrency },
        accessToken,
      });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Failed to log in" });
  }
});

router.post("/refresh", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ error: "Missing refresh token" });
  }

  try {
    const payload = verifyRefreshToken(token);

    const session = await Session.findOne({ userId: payload.sub, refreshToken: token });
    if (!session) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const { accessToken, refreshToken, expiresAt } = await createSessionAndTokens(
      payload.sub,
      payload.email,
    );

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: expiresAt,
      })
      .json({ accessToken });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});

router.post("/logout", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      await Session.deleteOne({ refreshToken: token });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  res
    .clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
    .json({ success: true });
});

// Google OAuth entry point
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/auth" }),
  async (req, res) => {
    const user = req.user;
    const { accessToken, refreshToken, expiresAt } = await createSessionAndTokens(
      user.id,
      user.email,
    );

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: expiresAt,
      })
      .redirect(`${process.env.CLIENT_ORIGIN || "http://localhost:5173"}/dashboard`);
  },
);

export default router;

