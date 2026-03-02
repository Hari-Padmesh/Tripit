import { Calendar, DollarSign, Sparkles, ChevronRight, Clock } from "lucide-react";
import React from "react";

interface Activity {
  title: string;
  description: string;
  category: string;
  cost: number;
  currency: string;
  timeOfDay: string;
}

interface ItineraryDay {
  date: string;
  label: string;
  activities: Activity[];
}

interface ItineraryCardProps {
  days?: ItineraryDay[];
  estimatedTotal?: number;
  currency?: string;
  loading?: boolean;
  onGenerateItinerary?: () => void;
  onViewFull?: () => void;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "food": return "text-orange-400 bg-orange-500/10";
    case "culture": return "text-purple-400 bg-purple-500/10";
    case "adventure": return "text-emerald-400 bg-emerald-500/10";
    case "relax": return "text-blue-400 bg-blue-500/10";
    default: return "text-slate-400 bg-slate-500/10";
  }
};

const getTimeIcon = (time: string) => {
  switch (time) {
    case "morning": return "🌅";
    case "afternoon": return "☀️";
    case "evening": return "🌆";
    case "night": return "🌙";
    default: return "⏰";
  }
};

export function ItineraryCard({ days, estimatedTotal, currency, loading, onGenerateItinerary, onViewFull }: ItineraryCardProps) {
  const previewDays = days?.slice(0, 2) || [];
  
  return (
    <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-sm font-medium text-slate-400">AI Itinerary</span>
        </div>
        {!days && onGenerateItinerary && (
          <button
            onClick={onGenerateItinerary}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3 h-3" />
            Generate
          </button>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
          <p className="text-sm text-slate-400">AI is planning your trip...</p>
        </div>
      )}
      
      {!loading && (!days || days.length === 0) && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-sm text-slate-400 mb-2">No itinerary generated yet</p>
          <p className="text-xs text-slate-500 mb-4">Create a trip wallet and let AI plan your activities</p>
          {onGenerateItinerary && (
            <button
              onClick={onGenerateItinerary}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 font-medium text-sm transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Generate Itinerary
            </button>
          )}
        </div>
      )}

      {!loading && days && days.length > 0 && (
        <div className="space-y-4">
          {previewDays.map((day, dayIdx) => (
            <div key={dayIdx} className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-sm text-white">{day.label}</span>
                <span className="text-xs text-slate-500">{day.date}</span>
              </div>
              <div className="space-y-2">
                {day.activities.slice(0, 3).map((activity, actIdx) => (
                  <div key={actIdx} className="flex items-start gap-2 text-sm">
                    <span className="text-base">{getTimeIcon(activity.timeOfDay)}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-white">{activity.title}</span>
                      <span className="ml-2 text-slate-500 text-xs">
                        {activity.cost} {activity.currency}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(activity.category)}`}>
                      {activity.category}
                    </span>
                  </div>
                ))}
                {day.activities.length > 3 && (
                  <p className="text-xs text-slate-500 pl-6">+{day.activities.length - 3} more activities...</p>
                )}
              </div>
            </div>
          ))}
          
          {days.length > 2 && (
            <p className="text-xs text-slate-500 text-center">+{days.length - 2} more days...</p>
          )}

          {/* Summary */}
          {estimatedTotal !== undefined && (
            <div className="bg-indigo-500/10 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-indigo-400" />
                <span className="text-sm text-slate-300">Estimated Total</span>
              </div>
              <span className="font-bold text-white">{estimatedTotal.toLocaleString()} {currency}</span>
            </div>
          )}

          {onViewFull && (
            <button
              onClick={onViewFull}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/50 text-slate-300 hover:bg-slate-800 font-medium text-sm transition-colors"
            >
              View Full Itinerary
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
