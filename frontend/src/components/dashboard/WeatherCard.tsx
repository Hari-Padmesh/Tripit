import { Cloud, Sun, CloudRain, Snowflake, Wind, Droplets, Thermometer } from "lucide-react";
import React from "react";

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather?: Array<{ description: string; main: string; icon: string }>;
  wind?: { speed: number };
  name?: string;
}

interface WeatherCardProps {
  weather?: WeatherData;
  loading?: boolean;
  error?: string;
}

function getWeatherIcon(condition?: string) {
  const lower = condition?.toLowerCase() || "";
  if (lower.includes("rain")) return <CloudRain className="w-14 h-14 text-blue-400" />;
  if (lower.includes("snow")) return <Snowflake className="w-14 h-14 text-cyan-300" />;
  if (lower.includes("cloud")) return <Cloud className="w-14 h-14 text-slate-400" />;
  return <Sun className="w-14 h-14 text-amber-400" />;
}

export function WeatherCard({ weather, loading, error }: WeatherCardProps) {
  const condition = weather?.weather?.[0]?.main;
  const description = weather?.weather?.[0]?.description;

  return (
    <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-sm font-medium text-slate-400">Weather</span>
        </div>
        {weather?.name && (
          <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded-lg">{weather.name}</span>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading weather...</span>
        </div>
      )}
      
      {error && <p className="text-sm text-red-400">{error}</p>}
      
      {!loading && !error && weather && (
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">{Math.round(weather.main.temp)}</span>
              <span className="text-xl text-slate-400">°C</span>
            </div>
            <p className="text-sm capitalize text-slate-400 mt-1">{description}</p>
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Thermometer className="w-3.5 h-3.5" />
                <span>Feels {Math.round(weather.main.feels_like)}°</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Droplets className="w-3.5 h-3.5" />
                <span>{weather.main.humidity}%</span>
              </div>
              {weather.wind && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Wind className="w-3.5 h-3.5" />
                  <span>{weather.wind.speed} m/s</span>
                </div>
              )}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-3">
            {getWeatherIcon(condition)}
          </div>
        </div>
      )}
    </div>
  );
}
