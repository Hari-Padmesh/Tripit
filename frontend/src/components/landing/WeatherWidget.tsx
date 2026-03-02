import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, MapPin, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import React from 'react';

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
  description: string;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude);
        },
        () => {
          setError('Unable to get your location — showing demo data');
          fetchWeather(40.7128, -74.006);
        },
      );
    } else {
      setError('Geolocation not supported — showing demo data');
      fetchWeather(40.7128, -74.006);
    }
  }, []);

  const fetchWeather = async (_lat: number, _lon: number) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const conditions = ['Clear', 'Partly Cloudy', 'Cloudy'];
      const descriptions = [
        'Perfect weather for exploring!',
        'Great day for a city walk.',
        'Cozy weather — grab a hot drink.',
      ];
      const idx = Math.floor(Math.random() * 3);

      const mockWeather: WeatherData = {
        temp: Math.floor(Math.random() * 15) + 20,
        condition: conditions[idx],
        humidity: Math.floor(Math.random() * 30) + 50,
        windSpeed: Math.floor(Math.random() * 10) + 5,
        location: 'Your location',
        description: descriptions[idx],
      };

      setWeather(mockWeather);
      setLoading(false);
    } catch {
      setError('Failed to fetch weather data');
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="w-16 h-16 text-yellow-500" />;
      case 'cloudy':
        return <Cloud className="w-16 h-16 text-gray-400" />;
      case 'partly cloudy':
        return <Cloud className="w-16 h-16 text-gray-300" />;
      case 'rain':
        return <CloudRain className="w-16 h-16 text-blue-500" />;
      default:
        return <Sun className="w-16 h-16 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  if (error && !weather) {
    return (
      <Card className="w-full">
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card className="w-full bg-gradient-to-br from-blue-50 to-cyan-50 border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="w-5 h-5 text-blue-600" />
          Current Weather
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <p className="text-xs text-gray-400">{error}</p>
        )}
        <div className="flex items-center gap-4">
          {getWeatherIcon(weather.condition)}
          <div>
            <div className="text-5xl font-light">{weather.temp}°C</div>
            <div className="text-gray-600">{weather.condition}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <MapPin className="w-4 h-4" />
          <span>{weather.location}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 bg-white/60 rounded-lg p-3">
            <Droplets className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-sm text-gray-600">Humidity</div>
              <div className="font-medium">{weather.humidity}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/60 rounded-lg p-3">
            <Wind className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-sm text-gray-600">Wind</div>
              <div className="font-medium">{weather.windSpeed} km/h</div>
            </div>
          </div>
        </div>

        <Badge variant="secondary" className="w-full justify-center py-2 bg-white/60 text-sm">
          {weather.description}
        </Badge>
      </CardContent>
    </Card>
  );
}
