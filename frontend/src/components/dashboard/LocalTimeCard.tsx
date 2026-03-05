import { Clock, Sun, Moon, Sunrise, Sunset } from "lucide-react";
import React, { useState, useEffect } from "react";

export function LocalTimeCard() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours();
  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Determine time of day for icon and greeting
  const getTimeOfDay = () => {
    if (hours >= 5 && hours < 12) {
      return { icon: Sunrise, label: "Good Morning", color: "text-amber-500", bg: "bg-amber-100" };
    } else if (hours >= 12 && hours < 17) {
      return { icon: Sun, label: "Good Afternoon", color: "text-orange-500", bg: "bg-orange-100" };
    } else if (hours >= 17 && hours < 21) {
      return { icon: Sunset, label: "Good Evening", color: "text-purple-500", bg: "bg-purple-100" };
    } else {
      return { icon: Moon, label: "Good Night", color: "text-indigo-500", bg: "bg-indigo-100" };
    }
  };

  const timeOfDay = getTimeOfDay();
  const TimeIcon = timeOfDay.icon;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-sm font-medium text-gray-500">Local Time</span>
        </div>
        <div className={`w-8 h-8 rounded-lg ${timeOfDay.bg} flex items-center justify-center`}>
          <TimeIcon className={`w-4 h-4 ${timeOfDay.color}`} />
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-2 mb-1">
          <h3 className="text-3xl font-bold text-gray-900 tabular-nums">
            {formattedTime}
          </h3>
        </div>
        <p className="text-sm text-gray-500 mb-3">{formattedDate}</p>
        <div className={`inline-flex items-center gap-2 text-xs ${timeOfDay.color} ${timeOfDay.bg} rounded-lg px-3 py-2`}>
          <TimeIcon className="w-3 h-3" />
          <span className="font-medium">{timeOfDay.label}</span>
        </div>
      </div>
    </div>
  );
}
