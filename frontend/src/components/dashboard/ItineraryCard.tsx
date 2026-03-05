import { Calendar, DollarSign, Sparkles, ChevronRight, Sunrise, Sun, Sunset, Moon, MapPin } from "lucide-react";
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
    case "food": return "text-orange-600 bg-orange-100";
    case "culture": return "text-purple-600 bg-purple-100";
    case "adventure": return "text-emerald-600 bg-emerald-100";
    case "relax": return "text-blue-600 bg-blue-100";
    default: return "text-gray-600 bg-gray-100";
  }
};

const TimeIcon = ({ time }: { time: string }) => {
  const iconClass = "w-3.5 h-3.5";
  switch (time) {
    case "morning": return <Sunrise className={`${iconClass} text-amber-500`} />;
    case "afternoon": return <Sun className={`${iconClass} text-yellow-500`} />;
    case "evening": return <Sunset className={`${iconClass} text-orange-500`} />;
    case "night": return <Moon className={`${iconClass} text-indigo-500`} />;
    default: return <MapPin className={`${iconClass} text-gray-500`} />;
  }
};

export function ItineraryCard({ days, estimatedTotal, currency, loading, onGenerateItinerary, onViewFull }: ItineraryCardProps) {
  const previewDays = days?.slice(0, 2) || [];
  
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-sm font-medium text-gray-500">AI Itinerary</span>
        </div>
        {!days && onGenerateItinerary && (
          <button
            onClick={onGenerateItinerary}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3 h-3" />
            Generate
          </button>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">AI is planning your trip...</p>
        </div>
      )}
      
      {!loading && (!days || days.length === 0) && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-500 mb-2">No itinerary generated yet</p>
          <p className="text-xs text-gray-400 mb-4">Create a trip wallet and let AI plan your activities</p>
          {onGenerateItinerary && (
            <button
              onClick={onGenerateItinerary}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-100 text-indigo-600 hover:bg-indigo-200 font-medium text-sm transition-colors"
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
            <div key={dayIdx} className="bg-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                  {dayIdx + 1}
                </div>
                <span className="font-semibold text-sm text-gray-900">{day.label}</span>
                <span className="text-xs text-gray-500">{day.date}</span>
              </div>
              <div className="space-y-2">
                {day.activities.slice(0, 3).map((activity, actIdx) => (
                  <div key={actIdx} className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <TimeIcon time={activity.timeOfDay} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-gray-900">{activity.title}</span>
                      <span className="ml-2 text-gray-500 text-xs">
                        {activity.cost} {activity.currency}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(activity.category)}`}>
                      {activity.category}
                    </span>
                  </div>
                ))}
                {day.activities.length > 3 && (
                  <p className="text-xs text-gray-500 pl-6">+{day.activities.length - 3} more activities...</p>
                )}
              </div>
            </div>
          ))}
          
          {days.length > 2 && (
            <p className="text-xs text-gray-500 text-center">+{days.length - 2} more days...</p>
          )}

          {/* Summary */}
          {estimatedTotal !== undefined && (
            <div className="bg-indigo-100 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                <span className="text-sm text-gray-700">Estimated Total</span>
              </div>
              <span className="font-bold text-gray-900">{estimatedTotal.toLocaleString()} {currency}</span>
            </div>
          )}

          {onViewFull && (
            <button
              onClick={onViewFull}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium text-sm transition-colors"
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
