/**
 * Geocoding utility using OpenStreetMap Nominatim API
 * Free geocoding service - no API key required
 * Rate limited: 1 request per second
 */

// Simple cache to avoid repeated geocoding of the same locations
const geocodeCache = new Map();

/**
 * Convert city/country to lat/lng coordinates
 * @param {string} city - City name
 * @param {string} country - Country name (optional)
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
export async function geocodeCity(city, country = "") {
  if (!city) return null;

  const query = country ? `${city}, ${country}` : city;
  const cacheKey = query.toLowerCase().trim();

  // Check cache first
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "BeyondlySmartTravelPlanner/1.0",
      },
    });

    if (!response.ok) {
      console.error("Geocoding API error:", response.status);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
      // Cache the result
      geocodeCache.set(cacheKey, result);
      return result;
    }

    // Cache null result to avoid repeated failed lookups
    geocodeCache.set(cacheKey, null);
    return null;
  } catch (err) {
    console.error("Geocoding error:", err.message);
    return null;
  }
}

/**
 * Ensure location has coordinates - geocode if missing
 * @param {Object} location - Location object with city, country, coordinates
 * @returns {Promise<Object>} - Location with coordinates
 */
export async function ensureLocationCoordinates(location) {
  if (!location) return location;

  const { city, country, coordinates } = location;
  
  // If we already have valid coordinates, return as-is
  if (coordinates && (coordinates.lat !== 0 || coordinates.lng !== 0)) {
    return location;
  }

  // Try to geocode from city/country
  if (city) {
    const coords = await geocodeCity(city, country);
    if (coords) {
      return {
        ...location,
        coordinates: coords,
        source: location.source || "geocoded",
      };
    }
  }

  return location;
}

export default { geocodeCity, ensureLocationCoordinates };
