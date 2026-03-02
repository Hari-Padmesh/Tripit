import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/User.js";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_DAYS = 7;

export function signAccessToken(payload) {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("JWT_ACCESS_SECRET not configured");
  return jwt.sign(payload, secret, { expiresIn: ACCESS_TOKEN_TTL });
}

export function signRefreshToken(payload) {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET not configured");
  return jwt.sign(payload, secret, {
    expiresIn: `${REFRESH_TOKEN_TTL_DAYS}d`,
  });
}

export function verifyAccessToken(token) {
  const secret = process.env.JWT_ACCESS_SECRET;
  return jwt.verify(token, secret);
}

export function verifyRefreshToken(token) {
  const secret = process.env.JWT_REFRESH_SECRET;
  return jwt.verify(token, secret);
}

export function configureGoogleStrategy() {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL;

  if (!clientID || !clientSecret || !callbackURL) {
    // Skip configuration if Google OAuth is not configured
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const googleId = profile.id;
          const name = profile.displayName;

          let user = await User.findOne({ googleId });

          if (!user && email) {
            user = await User.findOne({ email });
          }

          if (!user) {
            user = await User.create({
              email,
              googleId,
              name,
            });
          } else if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );
}

