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
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
            <Sun className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-sm font-medium text-gray-500">Weather</span>
        </div>
        {weather?.name && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{weather.name}</span>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-600 rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading weather...</span>
        </div>
      )}
      
      {error && <p className="text-sm text-red-600">{error}</p>}
      
      {!loading && !error && weather && (
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-gray-900">{Math.round(weather.main.temp)}</span>
              <span className="text-xl text-gray-500">°C</span>
            </div>
            <p className="text-sm capitalize text-gray-500 mt-1">{description}</p>
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Thermometer className="w-3.5 h-3.5" />
                <span>Feels {Math.round(weather.main.feels_like)}°</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Droplets className="w-3.5 h-3.5" />
                <span>{weather.main.humidity}%</span>
              </div>
              {weather.wind && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Wind className="w-3.5 h-3.5" />
                  <span>{weather.wind.speed} m/s</span>
                </div>
              )}
            </div>
          </div>
          <div className="bg-gray-100 rounded-2xl p-3">
            {getWeatherIcon(condition)}
          </div>
        </div>
      )}
    </div>
  );
}
