import { useState, useEffect } from 'react';
import { MapPin, Clock, Star, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import React from 'react';

interface Place {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: string;
  description: string;
  bestTime: string;
}

const DEMO_PLACES: Place[] = [
  {
    id: '1',
    name: 'Central Park',
    category: 'Nature',
    rating: 4.8,
    distance: '1.2 km',
    description: 'Beautiful urban park perfect for morning walks and picnics',
    bestTime: 'Morning',
  },
  {
    id: '2',
    name: 'Metropolitan Museum',
    category: 'Culture',
    rating: 4.9,
    distance: '2.5 km',
    description: 'World-class art museum with extensive collections',
    bestTime: 'Afternoon',
  },
  {
    id: '3',
    name: 'Brooklyn Bridge',
    category: 'Landmark',
    rating: 4.7,
    distance: '3.8 km',
    description: 'Iconic bridge with stunning city views and pedestrian walkway',
    bestTime: 'Evening',
  },
  {
    id: '4',
    name: 'Times Square',
    category: 'Entertainment',
    rating: 4.6,
    distance: '0.8 km',
    description: 'Bustling commercial intersection famous for its bright lights',
    bestTime: 'Night',
  },
];

export function PlacesSuggestions() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI fetching delay
    const t = setTimeout(() => {
      setPlaces(DEMO_PLACES);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI-Powered Place Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <p className="text-gray-600">Finding amazing places for you...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI-Powered Place Recommendations
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Personalized suggestions based on your location and preferences
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {places.map((place) => (
            <div
              key={place.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{place.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {place.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{place.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">{place.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{place.distance}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Best: {place.bestTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
