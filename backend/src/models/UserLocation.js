import mongoose from "mongoose";

const userLocationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    // City-level location (not precise GPS)
    city: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    // Coordinates (city center or approximate)
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    // Source of location data
    source: {
      type: String,
      enum: ["itinerary", "geolocation", "manual"],
      default: "itinerary",
    },
    // Last update time
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const UserLocation = mongoose.model("UserLocation", userLocationSchema);
