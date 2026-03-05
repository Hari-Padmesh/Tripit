import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { UserLocation } from "../models/UserLocation.js";
import { geocodeCity } from "../utils/geocoding.js";

const router = express.Router();

/* --------------------------------------------------
   GET MY PROFILE (includes Beyondly ID)
-------------------------------------------------- */
router.get("/me", requireAuth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Generate beyondlyId if missing (for existing users)
    if (!user.beyondlyId) {
      await user.save(); // This triggers the pre-save hook
      user = await User.findById(req.user.id).select("-passwordHash");
    }
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

/* --------------------------------------------------
   GET MY BEYONDLY ID
-------------------------------------------------- */
router.get("/my-id", requireAuth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select("beyondlyId name email avatar");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Generate beyondlyId if missing
    if (!user.beyondlyId) {
      const fullUser = await User.findById(req.user.id);
      await fullUser.save();
      user = await User.findById(req.user.id).select("beyondlyId name email avatar");
    }
    res.json({ beyondlyId: user.beyondlyId, name: user.name, email: user.email, avatar: user.avatar });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Beyondly ID" });
  }
});

/* --------------------------------------------------
   UPDATE PROFILE
-------------------------------------------------- */
router.patch("/me", requireAuth, async (req, res) => {
  try {
    const { name, avatar, locationVisible, preferredCurrency, defaultLanguage } = req.body;
    const updateFields = {};
    
    if (name !== undefined) updateFields.name = name;
    if (avatar !== undefined) updateFields.avatar = avatar;
    if (locationVisible !== undefined) updateFields.locationVisible = locationVisible;
    if (preferredCurrency !== undefined) updateFields.preferredCurrency = preferredCurrency;
    if (defaultLanguage !== undefined) updateFields.defaultLanguage = defaultLanguage;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { returnDocument: 'after' }
    ).select("-passwordHash");

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

/* --------------------------------------------------
   UPDATE USER LOCATION
-------------------------------------------------- */
router.post("/location", requireAuth, async (req, res) => {
  try {
    let { city, country, lat, lng, source } = req.body;
    
    // If no coordinates provided but have city, try to geocode
    if ((!lat || !lng || (lat === 0 && lng === 0)) && city) {
      console.log(`Geocoding city: ${city}, ${country}`);
      const geocoded = await geocodeCity(city, country);
      if (geocoded) {
        lat = geocoded.lat;
        lng = geocoded.lng;
        source = source || "geocoded";
        console.log(`Geocoded to: ${lat}, ${lng}`);
      }
    }
    
    const location = await UserLocation.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          city: city || "",
          country: country || "",
          coordinates: { lat: lat || 0, lng: lng || 0 },
          source: source || "manual",
          updatedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    res.json(location);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update location" });
  }
});

/* --------------------------------------------------
   GET USER LOCATION
-------------------------------------------------- */
router.get("/location", requireAuth, async (req, res) => {
  try {
    const location = await UserLocation.findOne({ userId: req.user.id });
    res.json(location || { city: "", country: "", coordinates: { lat: 0, lng: 0 } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch location" });
  }
});

export default router;
