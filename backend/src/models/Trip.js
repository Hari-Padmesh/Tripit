import mongoose from "mongoose";

const itineraryActivitySchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    category: String,
    cost: {
      type: Number,
      default: 0,
    },
    currency: String,
    timeOfDay: String,
  },
  { _id: false },
);

const itineraryDaySchema = new mongoose.Schema(
  {
    date: String,
    label: String,
    activities: [itineraryActivitySchema],
    dayTotal: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    startDate: Date,
    endDate: Date,
    walletCurrency: {
      type: String,
      required: true,
    },
    walletBudget: {
      type: Number,
      required: true,
    },
    walletSpent: {
      type: Number,
      default: 0,
    },
    weatherSnapshot: {
      type: mongoose.Schema.Types.Mixed,
    },
    itinerary: [itineraryDaySchema],
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

tripSchema.index({ userId: 1, createdAt: -1 });

export const Trip = mongoose.model("Trip", tripSchema);

