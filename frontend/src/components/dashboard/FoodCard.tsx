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
    <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <span className="text-sm font-medium text-slate-400">Food Suggestions</span>
            {locality && (
              <p className="text-xs text-slate-500">Weather-based picks for {locality}</p>
            )}
          </div>
        </div>
        <ChefHat className="w-5 h-5 text-slate-500" />
      </div>

      {loading && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Getting recommendations...</span>
        </div>
      )}

      {!loading && (!foods || foods.length === 0) && (
        <div className="text-center py-4">
          <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 text-slate-600" />
          <p className="text-sm text-slate-400">No food suggestions available yet.</p>
        </div>
      )}

      {!loading && foods && foods.length > 0 && (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {foods.slice(0, 4).map((food, idx) => (
            <div key={idx} className="bg-slate-800/50 rounded-xl p-3 hover:bg-slate-800/70 transition-colors">
              <h4 className="font-semibold text-sm text-white mb-1">{food.name}</h4>
              <p className="text-xs text-slate-400 mb-2">{food.description}</p>
              {food.whyItFitsWeather && (
                <div className="flex items-start gap-1.5 text-xs text-orange-400/80 bg-orange-500/5 rounded-lg px-2 py-1.5">
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
