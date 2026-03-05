import { UtensilsCrossed, ChefHat, Sparkles } from "lucide-react";
import React from "react";

interface FoodItem {
  name: string;
  description: string;
  whyItFitsWeather?: string;
}

interface FoodCardProps {
  foods?: FoodItem[];
  loading?: boolean;
  locality?: string;
}

export function FoodCard({ foods, loading, locality }: FoodCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Food Suggestions</span>
            {locality && (
              <p className="text-xs text-gray-400">Weather-based picks for {locality}</p>
            )}
          </div>
        </div>
        <ChefHat className="w-5 h-5 text-gray-400" />
      </div>

      {loading && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-orange-400/30 border-t-orange-600 rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Getting recommendations...</span>
        </div>
      )}

      {!loading && (!foods || foods.length === 0) && (
        <div className="text-center py-4">
          <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">No food suggestions available yet.</p>
        </div>
      )}

      {!loading && foods && foods.length > 0 && (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {foods.slice(0, 4).map((food, idx) => (
            <div key={idx} className="bg-gray-100 rounded-xl p-3 hover:bg-gray-200 transition-colors">
              <h4 className="font-semibold text-sm text-gray-900 mb-1">{food.name}</h4>
              <p className="text-xs text-gray-500 mb-2">{food.description}</p>
              {food.whyItFitsWeather && (
                <div className="flex items-start gap-1.5 text-xs text-orange-600 bg-orange-50 rounded-lg px-2 py-1.5">
                  <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{food.whyItFitsWeather}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
