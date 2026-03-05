import { useEffect, useState, useCallback } from "react";
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
import { Plane, MapPin, Calendar, Wallet, Plus, ArrowRight } from "lucide-react";

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
  const [todos, setTodos] = useState([
    { id: "1", title: "Check local weather forecast", completed: false, category: "planning" },
    { id: "2", title: "Exchange currency for trip", completed: false, category: "finance" },
    { id: "3", title: "Try recommended local dishes", completed: false, category: "food" },
    { id: "4", title: "Visit top attractions", completed: false, category: "sightseeing" },
    { id: "5", title: "Take photos for memories", completed: false, category: "personal" },
  ]);

  const latestTrip = trips[trips.length - 1];
  const userName = user?.name?.split(" ")[0] || "Traveler";

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
      {/* Welcome Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome back, {userName}! 
          </h1>
          <p className="text-gray-500 text-sm">
            Here's what's happening with your travel plans
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/trip/new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Trip
        </button>
      </header>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Plane className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
              <p className="text-xs text-gray-500">Total Trips</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ${trips.reduce((sum, t) => sum + (t.walletBudget || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Total Budget</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(trips.map(t => t.destination)).size}
              </p>
              <p className="text-xs text-gray-500">Destinations</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {trips.filter(t => new Date(t.endDate) > new Date()).length}
              </p>
              <p className="text-xs text-gray-500">Upcoming</p>
            </div>
          </div>
        </div>
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
            loading={false}
          />

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/dashboard/trip/new")}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  Plan New Trip
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => navigate("/dashboard/trips/history")}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  View Trip History
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => navigate("/dashboard/tools/translate")}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm transition-colors"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Translate Text
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

