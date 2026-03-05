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
  travelers: Joi.number().integer().min(1).default(1),
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
  travelers: Joi.number().integer().min(1).default(1),
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


function parseGeminiJson(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Empty Gemini response");
  }

  const cleanText = text.replace(/```json|```/g, "").trim();
  console.log("Gemini raw response:", cleanText.substring(0, 500));
  const firstBrace = cleanText.indexOf("{");
  let lastBrace = cleanText.lastIndexOf("}");
  if (firstBrace === -1) {
    console.error("Gemini response missing opening brace:", text);
    throw new Error("Incomplete Gemini JSON response");
  }
  if (lastBrace === -1 || lastBrace <= firstBrace) {
    // Try to recover partial JSON for foods array
    const foodsStart = cleanText.indexOf('"foods": [');
    if (foodsStart !== -1) {
      const arrStart = cleanText.indexOf('[', foodsStart);
      const arrEnd = cleanText.lastIndexOf(']');
      if (arrStart !== -1 && arrEnd > arrStart) {
        const partial = cleanText.slice(firstBrace, arrEnd + 1) + '}';
        try {
          return JSON.parse(partial);
        } catch (err) {
          // Try to extract individual food objects
          const foodRegex = /\{[^\{\}]*"name"\s*:\s*"[^"]+"[^\{\}]*"description"\s*:\s*"[^"]+"[^\{\}]*\}/g;
          const matches = cleanText.match(foodRegex);
          if (matches && matches.length > 0) {
            try {
              const foods = matches.map(objStr => JSON.parse(objStr));
              return { foods };
            } catch (err2) {
              console.error("Regex food extraction failed");
            }
          }
        }
      }
    }
    // Try to recover partial JSON by finding the last valid closing bracket for activities array
    const activitiesStart = cleanText.indexOf('"activities": [');
    if (activitiesStart !== -1) {
      // Find last closing bracket for array
      const arrStart = cleanText.indexOf('[', activitiesStart);
      const arrEnd = cleanText.lastIndexOf(']');
      if (arrStart !== -1 && arrEnd > arrStart) {
        // Build a partial JSON string
        const partial = cleanText.slice(firstBrace, arrEnd + 1) + '}';
        try {
          return JSON.parse(partial);
        } catch (err) {
          console.error("Gemini partial JSON recovery failed:", partial);
        }
      }
      // Regex fallback: extract valid activity objects from broken array
      const activityRegex = /\{[^\{\}]*"name"\s*:\s*"[^"]+"[^\{\}]*\}/g;
      const matches = cleanText.match(activityRegex);
      if (matches && matches.length > 0) {
        try {
          const activities = matches.map(objStr => JSON.parse(objStr));
          return { activities };
        } catch (err3) {
          console.error("Regex activity extraction failed:", matches);
        }
      }
    }
    console.error("Gemini response missing closing brace:", text);
    throw new Error("Incomplete Gemini JSON response");
  }
  const jsonText = cleanText.slice(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(jsonText);
  } catch (err) {
    // Try to recover partial JSON as above
    const activitiesStart = cleanText.indexOf('"activities": [');
    if (activitiesStart !== -1) {
      const arrStart = cleanText.indexOf('[', activitiesStart);
      const arrEnd = cleanText.lastIndexOf(']');
      if (arrStart !== -1 && arrEnd > arrStart) {
        const partial = cleanText.slice(firstBrace, arrEnd + 1) + '}';
        try {
          return JSON.parse(partial);
        } catch (err2) {
          console.error("Gemini partial JSON recovery failed:", partial);
        }
      }
      // Regex fallback: extract valid activity objects from broken array
      const activityRegex = /\{[^\{\}]*"name"\s*:\s*"[^"]+"[^\{\}]*\}/g;
      const matches = cleanText.match(activityRegex);
      if (matches && matches.length > 0) {
        try {
          const activities = matches.map(objStr => JSON.parse(objStr));
          return { activities };
        } catch (err3) {
          console.error("Regex activity extraction failed:", matches);
        }
      }
    }
    console.error("Gemini raw response:", text);
    throw err;
  }
}

function getErrorStatus(err) {
  return err?.status || err?.response?.status || err?.code;
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set");
  }

  const models = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
  ];

  let lastError;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const { data } = await axios.post(
        url,
        {
            systemInstruction: { parts: [{ text: "Respond ONLY with valid, complete JSON. No markdown fences. Do not truncate or cut off your response. If the output is too long, summarize or reduce details." }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
              maxOutputTokens: 2048,
            responseMimeType: "application/json",
          },
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      return parseGeminiJson(text);
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      const errorMsg = err.response?.data?.error?.message || "";

      if (status === 429 || errorMsg?.includes("RESOURCE_EXHAUSTED") || errorMsg?.includes("quota")) {
        console.warn(`Gemini model ${model} quota exhausted, trying next...`);
        continue;
      }

      if ([500, 503].includes(status)) {
        console.warn(`Gemini model ${model} server error (${status}), retrying...`);
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}

/* --------------------------------------------------
   WEATHER + FOOD
-------------------------------------------------- */
router.post("/weather-food", requireAuth, async (req, res) => {
  const { value, error } = weatherFoodSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    const weather = await callWeatherAPI(value.lat, value.lon);

    let foods = [];
    try {
      const prompt = `
You are a local food expert. Suggest exactly 3 local dishes.

Location: ${value.locality}
Weather: ${weather.weather?.[0]?.description}, Temp: ${weather.main?.temp}°C

Return ONLY this JSON (keep descriptions short, under 100 chars each):
{
  "foods": [
    { "name": "dish name", "description": "brief description", "whyItFitsWeather": "short reason" }
  ]
}
      `;

      const result = await callGemini(prompt);
      console.log("Food suggestions result:", JSON.stringify(result, null, 2));
      foods = result.foods || [];
      console.log("Parsed foods array:", foods.length, "items");
    } catch (aiErr) {
      console.warn("Gemini food error:", aiErr.message);
    }

    res.json({ weather, foods });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch weather and food suggestions" });
  }
});

/* --------------------------------------------------
   FX RATES
-------------------------------------------------- */
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
    console.error(err);
    res.status(500).json({ error: "Failed to fetch FX rates" });
  }
});

/* --------------------------------------------------
   CREATE WALLET / TRIP
-------------------------------------------------- */
router.post("/wallets", requireAuth, async (req, res) => {
  const { value, error } = walletSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    // If baseCurrency is provided, convert walletBudget
    const baseCurrency = req.body.baseCurrency || value.walletCurrency;
    let walletFxRate = 1;
    let walletBudgetConverted = value.walletBudget;
    if (baseCurrency !== value.walletCurrency) {
      try {
        const fxData = await callFxAPI(baseCurrency, value.walletCurrency);
        walletFxRate = fxData.rates?.[value.walletCurrency] || 1;
        walletBudgetConverted = value.walletBudget * walletFxRate;
      } catch (fxErr) {
        console.warn("FX rate unavailable, using 1:1");
      }
    }

    const trip = await Trip.create({
      userId: req.user.id,
      title: value.title,
      destination: value.destination,
      startDate: value.startDate,
      endDate: value.endDate,
      walletCurrency: value.walletCurrency,
      walletBudget: value.walletBudget,
      walletBudgetConverted,
      walletFxRate,
      walletSpent: 0,
      travelers: value.travelers || 1,
      itinerary: [],
    });

    res.status(201).json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create wallet" });
  }
});

/* --------------------------------------------------
   WALLET SUMMARY
-------------------------------------------------- */
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
        0
      ) || 0;

    res.json({
      tripId: trip.id,
      walletCurrency: trip.walletCurrency,
      walletBudget: trip.walletBudget,
      walletSpent,
      walletRemaining: Math.max(trip.walletBudget - walletSpent, 0),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load wallet" });
  }
});

/* --------------------------------------------------
   GENERATE ITINERARY (FIXED)
-------------------------------------------------- */
router.post("/itinerary", requireAuth, async (req, res) => {
  const { value, error } = itinerarySchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const {
    destination,
    startDate,
    endDate,
    walletCurrency,
    walletBudget,
    pace,
    interests,
    tripId,
    travelers,
  } = value;

  const numTravelers = travelers || 1;

  // Calculate trip days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysCount = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
  const dailyBudget = Math.floor(walletBudget / daysCount);
  const dailyBudgetPerPerson = Math.floor(dailyBudget / numTravelers);

  // Get summary first
  const summaryPrompt = `For a trip to ${destination} from ${startDate} to ${endDate} for ${numTravelers} traveler${numTravelers > 1 ? 's' : ''} with a total budget of ${walletBudget} ${walletCurrency}, give a 2-3 sentence summary in valid JSON: { "aiSummary": "..." }`;
  let aiSummary = "";
  try {
    const summaryResult = await callGemini(summaryPrompt);
    aiSummary = summaryResult.aiSummary || "";
  } catch (err) {
    aiSummary = "No AI summary available yet.";
  }

  // Generate itinerary day-by-day
  let itinerary = [];
  let walletSpent = 0;
  for (let i = 0; i < daysCount; i++) {
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + i);
    const isoDate = dayDate.toISOString().slice(0, 10);
    const dayPrompt = `For a trip to ${destination} on ${isoDate} for ${numTravelers} traveler${numTravelers > 1 ? 's' : ''} with a daily budget of ${dailyBudget} ${walletCurrency} total (${dailyBudgetPerPerson} ${walletCurrency} per person), list 3-5 activities. The costs should be TOTAL for all ${numTravelers} people, not per person. For each activity, provide: name, description, category (MUST be one of: "food", "transport", "accommodation", "activities", "shopping"), cost (total for group), and timeOfDay. Respond in valid JSON: { "activities": [ { "name": "...", "description": "...", "category": "food|transport|accommodation|activities|shopping", "cost": number, "timeOfDay": "..." } ] }`;
    let activities = [];
    let success = false;
    let lastError = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const dayResult = await callGemini(dayPrompt);
        activities = Array.isArray(dayResult.activities)
          ? dayResult.activities.map(a => ({
              title: a.name || a.title || "",
              description: a.description || "",
              category: a.category || "",
              cost: a.cost || 0,
              timeOfDay: a.timeOfDay || ""
            }))
          : [];
        walletSpent += activities.reduce((sum, a) => sum + (a.cost || 0), 0);
        success = true;
        break;
      } catch (err) {
        lastError = err;
        console.warn(`Gemini failed for day ${i + 1} (${isoDate}), attempt ${attempt}:`, err.message || err);
      }
    }
    if (!success) {
      console.warn(`No activities for day ${i + 1} (${isoDate}) after 2 attempts. Last error:`, lastError?.message || lastError);
      activities = [];
    }
    itinerary.push({ date: isoDate, label: `Day ${i + 1}`, activities });
  }

  // Save or update trip with generated itinerary and summary
  let trip = null;
  if (tripId) {
    trip = await Trip.findOne({ _id: tripId, userId: req.user.id });
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
      walletSpent,
      travelers: numTravelers,
      aiSummary,
      itinerary,
    });
  } else {
    trip.destination = destination;
    trip.startDate = startDate;
    trip.endDate = endDate;
    trip.walletCurrency = walletCurrency;
    trip.walletBudget = walletBudget;
    trip.walletSpent = walletSpent;
    trip.travelers = numTravelers;
    trip.aiSummary = aiSummary;
    trip.itinerary = itinerary;
    await trip.save();
  }
  res.json({
    tripId: trip.id,
    itinerary: trip.itinerary,
    estimatedTotal: walletSpent,
    aiSummary: trip.aiSummary,
  });
});

/* --------------------------------------------------
   LIST TRIPS
-------------------------------------------------- */
router.get("/trips", requireAuth, async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id }).sort({ startDate: 1 });
    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list trips" });
  }
});

/* --------------------------------------------------
   MONTHLY SUMMARY
-------------------------------------------------- */
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
    console.error(err);
    res.status(500).json({ error: "Failed to summarize trips" });
  }
});

export default router;

