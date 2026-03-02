import { useState, useEffect } from 'react';
import { UtensilsCrossed, DollarSign, MapPin, Star, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import React from 'react';

interface FoodPlace {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceRange: string;
  distance: string;
  description: string;
  speciality: string;
}

const DEMO_FOODS: FoodPlace[] = [
  {
    id: '1',
    name: "Joe's Pizza",
    cuisine: 'Italian',
    rating: 4.7,
    priceRange: '$$',
    distance: '0.5 km',
    description: 'Classic New York-style pizza with authentic flavors',
    speciality: 'Margherita Pizza',
  },
  {
    id: '2',
    name: 'Sushi Palace',
    cuisine: 'Japanese',
    rating: 4.9,
    priceRange: '$$$',
    distance: '1.3 km',
    description: 'Fresh sushi and sashimi with a modern twist',
    speciality: 'Omakase Set',
  },
  {
    id: '3',
    name: 'Taco Fiesta',
    cuisine: 'Mexican',
    rating: 4.6,
    priceRange: '$',
    distance: '0.9 km',
    description: 'Authentic Mexican street food and tacos',
    speciality: 'Carnitas Tacos',
  },
  {
    id: '4',
    name: 'Le Petit Bistro',
    cuisine: 'French',
    rating: 4.8,
    priceRange: '$$$$',
    distance: '2.1 km',
    description: 'Elegant French cuisine in a cozy atmosphere',
    speciality: 'Coq au Vin',
  },
  {
    id: '5',
    name: 'Spice Garden',
    cuisine: 'Indian',
    rating: 4.7,
    priceRange: '$$',
    distance: '1.7 km',
    description: 'Aromatic curries and traditional Indian dishes',
    speciality: 'Butter Chicken',
  },
  {
    id: '6',
    name: 'The Burger Joint',
    cuisine: 'American',
    rating: 4.5,
    priceRange: '$$',
    distance: '0.6 km',
    description: 'Gourmet burgers with creative toppings',
    speciality: 'Truffle Burger',
  },
];

export function FoodSuggestions() {
  const [foods, setFoods] = useState<FoodPlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setFoods(DEMO_FOODS);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UtensilsCrossed className="w-5 h-5 text-orange-600" />
            AI-Curated Food Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <p className="text-gray-600">Discovering delicious options nearby...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UtensilsCrossed className="w-5 h-5 text-orange-600" />
          AI-Curated Food Recommendations
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Taste the best local cuisine tailored to your preferences
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {foods.map((food) => (
            <div
              key={food.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="mb-2">
                <h3 className="font-semibold">{food.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {food.cuisine}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{food.rating}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-2">{food.description}</p>

              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {food.speciality}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{food.distance}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  <span>{food.priceRange}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
