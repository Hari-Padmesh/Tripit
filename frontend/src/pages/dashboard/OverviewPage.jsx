import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useWeather } from "../../hooks/useWeather.js";
import { useTrips } from "../../hooks/useTrips.js";
import { useFxRates } from "../../hooks/useFxRates.js";
import { LocationCard } from "../../components/dashboard/LocationCard";
import { WeatherCard } from "../../components/dashboard/WeatherCard";
import { WalletCard } from "../../components/dashboard/WalletCard";
import { ExchangeRatesCard } from "../../components/dashboard/ExchangeRatesCard";
import { FoodCard } from "../../components/dashboard/FoodCard";
import { TodoCard } from "../../components/dashboard/TodoCard";
import { ItineraryCard } from "../../components/dashboard/ItineraryCard";
import { ExpenseCard } from "../../components/dashboard/ExpenseCard";
import { LocalTimeCard } from "../../components/dashboard/LocalTimeCard";
import { 
  Plane, MapPin, Calendar, Wallet, Plus, ArrowRight, 
  Sparkles, TrendingUp, Globe, Clock, ChevronRight, Compass
} from "lucide-react";

// Travel quotes for inspiration
const travelQuotes = [
  { text: "The world is a book and those who do not travel read only one page.", author: "Saint Augustine" },
  { text: "Travel is the only thing you buy that makes you richer.", author: "Anonymous" },
  { text: "Life is either a daring adventure or nothing at all.", author: "Helen Keller" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  { text: "Adventure is worthwhile in itself.", author: "Amelia Earhart" },
];

export default function OverviewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading: weatherLoading, error: weatherError, fetchWeatherAndFood } = useWeather();
  const { trips, generateItinerary } = useTrips();
  const { rate, loading: fxLoading, error: fxError, fetchRate } = useFxRates();
  
  const [locationError, setLocationError] = useState("");
  const [locationLoading, setLocationLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [hoveredStat, setHoveredStat] = useState(null);
  const [todos, setTodos] = useState([
    { id: "1", title: "Check local weather forecast", completed: false, category: "planning" },
    { id: "2", title: "Exchange currency for trip", completed: false, category: "finance" },
    { id: "3", title: "Try recommended local dishes", completed: false, category: "food" },
    { id: "4", title: "Visit top attractions", completed: false, category: "sightseeing" },
    { id: "5", title: "Take photos for memories", completed: false, category: "personal" },
  ]);

  const latestTrip = trips[trips.length - 1];
  const userName = user?.name?.split(" ")[0] || "Traveler";

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good morning", emoji: "🌅" };
    if (hour < 17) return { text: "Good afternoon", emoji: "☀️" };
    if (hour < 21) return { text: "Good evening", emoji: "🌆" };
    return { text: "Good night", emoji: "🌙" };
  };
  const greeting = getGreeting();

  // Random travel quote
  const quote = useMemo(() => travelQuotes[Math.floor(Math.random() * travelQuotes.length)], []);

  // Calculate days until next trip
  const nextTrip = useMemo(() => {
    const upcoming = trips
      .filter(t => new Date(t.startDate) > new Date())
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
    if (upcoming) {
      const days = Math.ceil((new Date(upcoming.startDate) - new Date()) / (1000 * 60 * 60 * 24));
      return { ...upcoming, daysUntil: days };
    }
    return null;
  }, [trips]);

  // Calculate travel stats
  const stats = useMemo(() => ({
    totalTrips: trips.length,
    totalBudget: trips.reduce((sum, t) => sum + (t.walletBudget || 0), 0),
    destinations: new Set(trips.map(t => t.destination)).size,
    upcoming: trips.filter(t => new Date(t.endDate) > new Date()).length,
    totalDays: trips.reduce((sum, t) => {
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      return sum + Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }, 0)
  }), [trips]);

  // Calculate category-wise spending from itinerary
  const expenseCategories = useMemo(() => {
    const categoryMap = {
      food: { name: "Food", amount: 0, color: "bg-orange-400", keywords: ["food", "restaurant", "dining", "eat", "meal", "breakfast", "lunch", "dinner", "cafe", "cuisine"] },
      transport: { name: "Transport", amount: 0, color: "bg-blue-400", keywords: ["transport", "taxi", "uber", "bus", "train", "flight", "car", "metro", "transfer", "travel"] },
      accommodation: { name: "Accommodation", amount: 0, color: "bg-purple-400", keywords: ["hotel", "accommodation", "stay", "hostel", "resort", "lodge", "airbnb", "check-in"] },
      activities: { name: "Activities", amount: 0, color: "bg-emerald-400", keywords: ["tour", "visit", "museum", "park", "temple", "beach", "hiking", "adventure", "explore", "sightseeing", "attraction"] },
      shopping: { name: "Shopping", amount: 0, color: "bg-pink-400", keywords: ["shopping", "market", "souvenir", "store", "mall", "buy"] },
    };

    if (latestTrip?.itinerary) {
      latestTrip.itinerary.forEach(day => {
        (day.activities || []).forEach(activity => {
          const cost = activity.cost || 0;
          const cat = (activity.category || "").toLowerCase();
          const title = (activity.title || activity.name || "").toLowerCase();
          const desc = (activity.description || "").toLowerCase();
          const text = `${cat} ${title} ${desc}`;
          
          // Match category by activity.category field first, then by keywords
          let matched = false;
          for (const [key, data] of Object.entries(categoryMap)) {
            if (cat.includes(key) || data.keywords.some(kw => text.includes(kw))) {
              categoryMap[key].amount += cost;
              matched = true;
              break;
            }
          }
          // If no match, add to activities
          if (!matched && cost > 0) {
            categoryMap.activities.amount += cost;
          }
        });
      });
    }

    return Object.values(categoryMap);
  }, [latestTrip]);

  // Fetch location and weather on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not available");
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lon: longitude });
        setLocationLoading(false);
        
        fetchWeatherAndFood({
          lat: latitude,
          lon: longitude,
          locality: "your location",
        });
      },
      () => {
        setLocationError("Location permission denied");
        setLocationLoading(false);
      },
    );
  }, [fetchWeatherAndFood]);

  // Update location info when weather data arrives
  useEffect(() => {
    if (data?.weather?.name) {
      setLocation(prev => prev ? { ...prev, city: data.weather.name } : null);
    }
  }, [data]);

  // Fetch FX rates on mount
  useEffect(() => {
    fetchRate({ base: "USD", target: "EUR" });
  }, [fetchRate]);

  const handleToggleTodo = useCallback((id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const handleCreateWallet = useCallback(() => {
    navigate("/dashboard/trip/new");
  }, [navigate]);

  const handleGenerateItinerary = useCallback(async () => {
    if (!latestTrip) {
      navigate("/dashboard/trip/new");
      return;
    }
    setItineraryLoading(true);
    try {
      await generateItinerary({
        tripId: latestTrip._id,
        destination: latestTrip.destination,
        startDate: latestTrip.startDate || new Date().toISOString(),
        endDate: latestTrip.endDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        walletCurrency: latestTrip.walletCurrency,
        walletBudget: latestTrip.walletBudget,
        pace: "balanced",
        interests: [],
      });
    } catch (err) {
      console.error("Failed to generate itinerary:", err);
    } finally {
      setItineraryLoading(false);
    }
  }, [latestTrip, generateItinerary, navigate]);

  const handleViewTrip = useCallback(() => {
    if (latestTrip?._id) {
      navigate(`/dashboard/trip/${latestTrip._id}`);
    }
  }, [latestTrip, navigate]);

  return (
    <div className="space-y-6">
      {/* Welcome Header with Gradient */}
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30 pointer-events-none" />
        <div className="relative flex items-center justify-between z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl animate-bounce">{greeting.emoji}</span>
              <h1 className="text-2xl md:text-3xl font-bold">
                {greeting.text}, {userName}!
              </h1>
            </div>
            <p className="text-blue-100 text-sm md:text-base max-w-xl">
              "{quote.text}" — <span className="italic">{quote.author}</span>
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/trip/new")}
            className="hidden md:flex items-center gap-2 px-5 py-3 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium text-sm transition-all hover:scale-105 border border-white/20 z-10 relative"
          >
            <Plus className="w-5 h-5" />
            Plan New Adventure
          </button>
        </div>
        
        {/* Floating decorative elements */}
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-20 -bottom-8 w-32 h-32 rounded-full bg-purple-400/20 blur-2xl pointer-events-none" />
      </header>

      {/* Next Trip Countdown (if upcoming) */}
      {nextTrip && (
        <div 
          onClick={() => navigate(`/dashboard/trip/${nextTrip._id}`)}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Compass className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <p className="text-emerald-100 text-sm font-medium">Next Adventure</p>
                <h3 className="text-xl font-bold">{nextTrip.destination}</h3>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{nextTrip.daysUntil}</span>
                <span className="text-emerald-100 text-sm">days</span>
              </div>
              <p className="text-emerald-100 text-xs">until departure</p>
            </div>
            <ChevronRight className="w-6 h-6 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        </div>
      )}

      {/* Quick Stats - Interactive Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            key: 'trips', 
            icon: Plane, 
            value: stats.totalTrips, 
            label: 'Total Trips', 
            color: 'blue',
            gradient: 'from-blue-500 to-blue-600'
          },
          { 
            key: 'budget', 
            icon: Wallet, 
            value: `$${stats.totalBudget.toLocaleString()}`, 
            label: 'Total Budget', 
            color: 'emerald',
            gradient: 'from-emerald-500 to-emerald-600'
          },
          { 
            key: 'destinations', 
            icon: Globe, 
            value: stats.destinations, 
            label: 'Destinations', 
            color: 'purple',
            gradient: 'from-purple-500 to-purple-600'
          },
          { 
            key: 'upcoming', 
            icon: Calendar, 
            value: stats.upcoming, 
            label: 'Upcoming', 
            color: 'amber',
            gradient: 'from-amber-500 to-orange-500'
          },
        ].map((stat) => (
          <div
            key={stat.key}
            onMouseEnter={() => setHoveredStat(stat.key)}
            onMouseLeave={() => setHoveredStat(null)}
            className={`relative overflow-hidden rounded-2xl p-4 border shadow-sm cursor-pointer transition-all duration-300 ${
              hoveredStat === stat.key 
                ? `bg-gradient-to-br ${stat.gradient} text-white scale-105 shadow-lg` 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3 relative z-10">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                hoveredStat === stat.key 
                  ? 'bg-white/20' 
                  : `bg-${stat.color}-100`
              }`}>
                <stat.icon className={`w-5 h-5 transition-colors ${
                  hoveredStat === stat.key 
                    ? 'text-white' 
                    : `text-${stat.color}-600`
                }`} />
              </div>
              <div>
                <p className={`text-2xl font-bold transition-colors ${
                  hoveredStat === stat.key ? 'text-white' : 'text-gray-900'
                }`}>
                  {stat.value}
                </p>
                <p className={`text-xs transition-colors ${
                  hoveredStat === stat.key ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {stat.label}
                </p>
              </div>
            </div>
            {hoveredStat === stat.key && (
              <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 blur-xl" />
            )}
          </div>
        ))}
      </section>

      {/* Main Content Grid - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Primary Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Location & Weather Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LocationCard
              city={location?.city || data?.weather?.name}
              country={location?.country}
              coordinates={location ? { lat: location.lat, lon: location.lon } : undefined}
              loading={locationLoading}
              error={locationError}
            />
            <WeatherCard
              weather={data?.weather}
              loading={weatherLoading}
              error={locationError || (weatherError ? "Failed to load weather" : undefined)}
            />
            <LocalTimeCard />
          </div>

          {/* Itinerary Card */}
          <ItineraryCard
            days={latestTrip?.itinerary}
            estimatedTotal={latestTrip?.walletSpent}
            currency={latestTrip?.walletCurrency}
            loading={itineraryLoading}
            onGenerateItinerary={handleGenerateItinerary}
            onViewFull={handleViewTrip}
          />

          {/* Food & Todo Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FoodCard
              foods={data?.foods}
              loading={weatherLoading}
              locality={data?.weather?.name || "your area"}
            />
            <TodoCard
              todos={todos}
              locality={data?.weather?.name}
              onToggle={handleToggleTodo}
            />
          </div>
        </div>

        {/* Right Column - Secondary Cards */}
        <div className="space-y-6">
          {/* Wallet Card */}
          <WalletCard
            tripTitle={latestTrip?.title}
            currency={latestTrip?.walletCurrency}
            budget={latestTrip?.walletBudget}
            spent={latestTrip?.walletSpent}
            onCreateWallet={handleCreateWallet}
            loading={false}
          />

          {/* Exchange Rates */}
          <ExchangeRatesCard
            baseCurrency="USD"
            targetCurrency="EUR"
            rate={rate?.rate}
            loading={fxLoading}
            error={fxError ? "Failed to load rates" : undefined}
            onFetchRate={(base, target) => fetchRate({ base, target })}
          />

          {/* Expense Card */}
          <ExpenseCard
            totalBudget={latestTrip?.walletBudget || 0}
            totalSpent={latestTrip?.walletSpent || 0}
            currency={latestTrip?.walletCurrency || "USD"}
            categories={expenseCategories}
            loading={false}
          />

          {/* Quick Actions - Enhanced */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/dashboard/trip/new")}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-sm transition-all hover:scale-[1.02] hover:shadow-md group"
              >
                <span className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Plan New Trip</span>
                </span>
                <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/dashboard/trips/history")}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-700 text-sm transition-all hover:scale-[1.02] border border-gray-200 hover:border-gray-300 hover:shadow-sm group"
              >
                <span className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="font-medium">View Trip History</span>
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/dashboard/tools/translate")}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-700 text-sm transition-all hover:scale-[1.02] border border-gray-200 hover:border-gray-300 hover:shadow-sm group"
              >
                <span className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="font-medium">Translate Text</span>
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/dashboard/social")}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-700 text-sm transition-all hover:scale-[1.02] border border-gray-200 hover:border-gray-300 hover:shadow-sm group"
              >
                <span className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-pink-600" />
                  </div>
                  <span className="font-medium">Connect with Travelers</span>
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile New Trip Button */}
      <button
        onClick={() => navigate("/dashboard/trip/new")}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}

