import { MapPin, Navigation, Globe2 } from "lucide-react";
import React from "react";

interface LocationCardProps {
  city?: string;
  country?: string;
  coordinates?: { lat: number; lon: number };
  loading?: boolean;
  error?: string;
}

export function LocationCard({ city, country, coordinates, loading, error }: LocationCardProps) {
  return (
    <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-sm font-medium text-slate-400">Current Location</span>
        </div>
        <Globe2 className="w-5 h-5 text-slate-500" />
      </div>
      
      {loading && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Detecting location...</span>
        </div>
      )}
      
      {error && <p className="text-sm text-red-400">{error}</p>}
      
      {!loading && !error && (
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">{city || "Unknown City"}</h3>
          <p className="text-sm text-slate-400 mb-3">{country || "Unknown Country"}</p>
          {coordinates && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800/50 rounded-lg px-3 py-2">
              <Navigation className="w-3 h-3" />
              <span>{coordinates.lat.toFixed(4)}°N, {coordinates.lon.toFixed(4)}°E</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
