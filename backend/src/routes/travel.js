import express from "express";
import axios from "axios";
import Joi from "joi";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import { Trip } from "../models/Trip.js";

const router = express.Router();

const weatherFoodSchema = Joi.object({
  lat: Joi.number().required(),
  lon: Joi.number().required(),
  locality: Joi.string().min(1).required(),
});

const fxSchema = Joi.object({
  base: Joi.string().length(3).required(),
  target: Joi.string().length(3).required(),
});

const walletSchema = Joi.object({
  title: Joi.string().min(1).required(),
  destination: Joi.string().min(1).required(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  walletCurrency: Joi.string().length(3).required(),
  walletBudget: Joi.number().positive().required(),
});

const itinerarySchema = Joi.object({
  tripId: Joi.string().optional(),
  destination: Joi.string().min(1).required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  walletCurrency: Joi.string().length(3).required(),
  walletBudget: Joi.number().positive().required(),
  pace: Joi.string().valid("relaxed", "balanced", "full").default("balanced"),
  interests: Joi.array().items(Joi.string()).default([]),
});

async function callWeatherAPI(lat, lon) {
  // Using Open-Meteo API (free, no key required)
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
  const { data } = await axios.get(url);
  
  // Also get location name via reverse geocoding
  let locationName = "Unknown";
  try {
    const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const geoRes = await axios.get(geoUrl, {
      headers: { "User-Agent": "SmartTravelPlanner/1.0" }
    });
    locationName = geoRes.data?.address?.city || geoRes.data?.address?.town || geoRes.data?.address?.village || geoRes.data?.display_name?.split(",")[0] || "Unknown";
  } catch {
    // Ignore geocoding errors
  }

  // Map Open-Meteo weather codes to descriptions
  const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Foggy", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
    80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail",
  };

  const current = data.current;
  const weatherCode = current.weather_code;
  
  // Transform to OpenWeatherMap-like format for compatibility
  return {
    name: locationName,
    main: {
      temp: current.temperature_2m,
      feels_like: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
    },
    weather: [
      {
        id: weatherCode,
        description: weatherCodes[weatherCode] || "Unknown",
        main: weatherCodes[weatherCode] || "Unknown",
      }
    ],
    wind: {
      speed: current.wind_speed_10m,
    },
  };
}

async function callFxAPI(base, target) {
  // Using free ExchangeRate-API (no key required for basic usage)
  const url = `https://api.exchangerate-api.com/v4/latest/${base}`;
  const { data } = await axios.get(url);
  return {
    rates: data.rates,
    base: data.base,
    date: data.date,
  };
}

async function callGemini(prompt, systemInstruction) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  
  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
  
  let lastError = null;
  for (const model of models) {
    try {
      console.log(`Trying Gemini model: ${model}`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const { data } = await axios.post(
        `${url}?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: systemInstruction
            ? { role: "system", parts: [{ text: systemInstruction }] }
            : undefined,
        },
        { headers: { "Content-Type": "application/json" } },
      );
      return data;
    } catch (err) {
      lastError = err;
      // If rate limited, try next model
      if (err.response?.status === 429) {
        console.log(`Model ${model} rate limited, trying next...`);
        continue;
      }
      throw err; // For other errors, rethrow immediately
    }
  }
  throw lastError; // All models failed
}

router.post("/weather-food", requireAuth, async (req, res) => {
  const { value, error } = weatherFoodSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    const weather = await callWeatherAPI(value.lat, value.lon);

    // Try to get food suggestions, but don't fail if Gemini is unavailable
    let foods = [];
    try {
      const prompt = `
You are a local food expert. Given the following weather and locality, suggest 5–8 local dishes or drinks that are ideal for this weather.
Return a valid JSON array named "foods" with objects: { "name": string, "description": string, "whyItFitsWeather": string }.

Location: ${value.locality}
Weather: ${weather.weather?.[0]?.description}, temperature ${weather.main?.temp}°C, feels like ${weather.main?.feels_like}°C.
`;

      const geminiResponse = await callGemini(
        prompt,
        "Respond ONLY with JSON, no extra text.",
      );
      const text = geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      try {
        const parsed = JSON.parse(text);
        foods = parsed.foods || parsed || [];
      } catch {
        foods = [];
      }
    } catch (geminiErr) {
      // Gemini failed - continue with empty foods
      console.log("Gemini unavailable, skipping food suggestions");
    }

    res.json({ weather, foods });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Failed to fetch weather and food suggestions" });
  }
});

router.get("/fx-rates", requireAuth, async (req, res) => {
  const { value, error } = fxSchema.validate(req.query);
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    const data = await callFxAPI(value.base, value.target);
    const rate = data.rates?.[value.target];
    res.json({ base: value.base, target: value.target, rate, raw: data });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Failed to fetch FX rates" });
  }
});

router.post("/wallets", requireAuth, async (req, res) => {
  const { value, error } = walletSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    const trip = await Trip.create({
      userId: req.user.id,
      title: value.title,
      destination: value.destination,
      startDate: value.startDate,
      endDate: value.endDate,
      walletCurrency: value.walletCurrency,
      walletBudget: value.walletBudget,
      walletSpent: 0,
    });

    res.status(201).json(trip);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Failed to create wallet" });
  }
});

router.get("/wallets/:tripId", requireAuth, async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.tripId,
      userId: req.user.id,
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const walletSpent =
      trip.itinerary?.reduce(
        (sum, day) =>
          sum +
          (day.activities || []).reduce((s, a) => s + (a.cost || 0), 0),
        0,
      ) || 0;

    res.json({
      tripId: trip.id,
      walletCurrency: trip.walletCurrency,
      walletBudget: trip.walletBudget,
      walletSpent,
      walletRemaining: Math.max(trip.walletBudget - walletSpent, 0),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Failed to load wallet" });
  }
});

router.post("/itinerary", requireAuth, async (req, res) => {
  const { value, error } = itinerarySchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const { destination, startDate, endDate, walletCurrency, walletBudget, pace, interests } =
    value;

  const prompt = `
Plan a detailed multi-day travel itinerary for ${destination}.
Travel dates: from ${startDate} to ${endDate}.
Total budget: ${walletBudget} ${walletCurrency}.
Traveler pace: ${pace}.
Interests: ${interests.join(", ") || "general sightseeing, local culture, and food"}.

Constraints:
- Keep the total estimated spend within the budget.
- Include a mix of local food, sightseeing, and 1–2 distinctive experiences.

Return JSON object with:
{
  "days": [
    {
      "date": "YYYY-MM-DD",
      "label": "Day 1",
      "activities": [
        {
          "title": "string",
          "description": "string",
          "category": "food|culture|adventure|relax|other",
          "cost": number,
          "currency": "${walletCurrency}",
          "timeOfDay": "morning|afternoon|evening|night"
        }
      ]
    }
  ],
  "summary": {
    "estimatedTotal": number,
    "currency": "${walletCurrency}"
  }
}
`;

  try {
    let geminiResponse;
    try {
      geminiResponse = await callGemini(
        prompt,
        "Respond ONLY with JSON, no extra commentary.",
      );
    } catch (geminiErr) {
      const statusCode = geminiErr.response?.status;
      const errorData = geminiErr.response?.data?.error;
      console.error("Gemini API error details:", {
        status: statusCode,
        error: errorData,
        message: geminiErr.message
      });
      
      if (geminiErr.message === "GEMINI_API_KEY is not configured") {
        return res.status(500).json({ error: "AI service not configured. Please set GEMINI_API_KEY." });
      }
      if (statusCode === 429) {
        return res.status(429).json({ 
          error: "AI service rate limit exceeded. Please wait a minute and try again.",
          retryAfter: 60
        });
      }
      if (statusCode === 400) {
        return res.status(400).json({ error: "Invalid request to AI service: " + (errorData?.message || geminiErr.message) });
      }
      return res.status(503).json({ error: "AI service temporarily unavailable. Please try again later." });
    }

    const text = geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { days: [], summary: { estimatedTotal: 0, currency: walletCurrency } };
    }

    const days = parsed.days || [];
    const estimatedTotal = parsed.summary?.estimatedTotal || 0;

    let trip;
    if (value.tripId) {
      trip = await Trip.findOne({
        _id: value.tripId,
        userId: req.user.id,
      });
    }

    if (!trip) {
      trip = await Trip.create({
        userId: req.user.id,
        title: `${destination} trip`,
        destination,
        startDate,
        endDate,
        walletCurrency,
        walletBudget,
        walletSpent: estimatedTotal,
        itinerary: days,
      });
    } else {
      trip.destination = destination;
      trip.startDate = startDate;
      trip.endDate = endDate;
      trip.walletCurrency = walletCurrency;
      trip.walletBudget = walletBudget;
      trip.walletSpent = estimatedTotal;
      trip.itinerary = days;
      await trip.save();
    }

    res.json({ tripId: trip.id, itinerary: trip.itinerary, estimatedTotal });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Failed to generate itinerary" });
  }
});

router.get("/trips", requireAuth, async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id }).sort({ startDate: 1 });
    res.json(trips);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Failed to list trips" });
  }
});

router.get("/trips/summary-by-month", requireAuth, async (req, res) => {
  try {
    const summary = await Trip.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: {
            year: { $year: "$startDate" },
            month: { $month: "$startDate" },
          },
          totalSpent: { $sum: "$walletSpent" },
          currency: { $first: "$walletCurrency" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json(summary);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Failed to summarize trips" });
  }
});

export default router;

