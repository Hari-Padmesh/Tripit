import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTrips } from "../../hooks/useTrips.js";
import { useFxRates } from "../../hooks/useFxRates.js";
import { 
  Users, 
  MapPin, 
  Calendar, 
  Wallet, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Plane,
  Coffee,
  Zap,
  Clock,
  Camera,
  Utensils,
  Landmark,
  ShoppingBag,
  Music,
  TreePine,
  Heart,
  Bike,
  Sun,
  X
} from "lucide-react";

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
];

const paceOptions = [
  { 
    value: "relaxed", 
    label: "Relaxed", 
    icon: Coffee, 
    description: "Slow mornings, 2-3 activities per day",
    color: "#10b981",
    bgColor: "#ecfdf5"
  },
  { 
    value: "balanced", 
    label: "Balanced", 
    icon: Sun, 
    description: "Mix of activities and downtime",
    color: "#6366f1",
    bgColor: "#eef2ff"
  },
  { 
    value: "full", 
    label: "Adventure", 
    icon: Zap, 
    description: "Packed days, see everything!",
    color: "#f59e0b",
    bgColor: "#fffbeb"
  },
];

const interestOptions = [
  { value: "food", label: "Food & Dining", icon: Utensils, color: "#f97316" },
  { value: "history", label: "History", icon: Landmark, color: "#8b5cf6" },
  { value: "photography", label: "Photography", icon: Camera, color: "#ec4899" },
  { value: "shopping", label: "Shopping", icon: ShoppingBag, color: "#f59e0b" },
  { value: "nightlife", label: "Nightlife", icon: Music, color: "#6366f1" },
  { value: "nature", label: "Nature", icon: TreePine, color: "#10b981" },
  { value: "wellness", label: "Wellness", icon: Heart, color: "#ef4444" },
  { value: "adventure", label: "Adventure", icon: Bike, color: "#0ea5e9" },
];

const steps = [
  { id: 1, title: "Destination", icon: MapPin },
  { id: 2, title: "Budget", icon: Wallet },
  { id: 3, title: "Preferences", icon: Sparkles },
];

export default function NewTripPage() {
  const [showLoader, setShowLoader] = useState(false);
  const { createWalletTrip, generateItinerary } = useTrips();
  const { rate, fetchRate } = useFxRates();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    walletCurrency: "USD",
    walletBudget: 1000,
    baseCurrency: "USD",
    pace: "balanced",
    interests: [],
    travelers: 1,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleInterest = (interest) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const canProceed = () => {
    if (step === 1) return form.title && form.destination && form.startDate && form.endDate;
    if (step === 2) return form.walletBudget > 0;
    return true;
  };

  const onNext = () => {
    if (!canProceed()) return;
    setStep((s) => Math.min(s + 1, 3));
  };

  const onBack = () => setStep((s) => Math.max(s - 1, 1));

  const onEstimateFx = async () => {
    setError("");
    try {
      await fetchRate({
        base: form.baseCurrency,
        target: form.walletCurrency,
      });
    } catch {
      setError("Unable to fetch FX rate right now.");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowLoader(true);
    try {
      setSaving(true);

      let finalBudget = Number(form.walletBudget);
      if (rate && rate.rate && form.baseCurrency !== form.walletCurrency) {
        finalBudget = Number(form.walletBudget) * rate.rate;
      }

      const walletTrip = await createWalletTrip({
        title: form.title,
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
        walletCurrency: form.walletCurrency,
        walletBudget: Math.round(finalBudget * 100) / 100,
        travelers: Number(form.travelers) || 1,
      });

      await generateItinerary({
        tripId: walletTrip._id,
        destination: walletTrip.destination,
        startDate: walletTrip.startDate,
        endDate: walletTrip.endDate,
        walletCurrency: walletTrip.walletCurrency,
        walletBudget: walletTrip.walletBudget,
        pace: form.pace,
        interests: form.interests,
        travelers: Number(form.travelers) || 1,
      });

      navigate(`/dashboard/trip/${walletTrip._id}`);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to create trip. Try again.";
      setError(errorMsg);
    } finally {
      setSaving(false);
      setShowLoader(false);
    }
  };

  // Loading State
  if (showLoader) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse">
            <Plane className="w-12 h-12 text-white" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Creating Your Adventure</h2>
        <p className="text-gray-500 text-center max-w-sm">
          Beyondly is crafting a personalized itinerary just for you. This may take a moment...
        </p>
        <div className="mt-8 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  const tripDays = form.startDate && form.endDate
    ? Math.max(1, Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24)) + 1)
    : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          AI-Powered Trip Planning
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Plan Your Next Adventure</h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Tell us about your dream trip and Beyondly will create a personalized itinerary within your budget
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-10">
        {steps.map((s, idx) => {
          const StepIcon = s.icon;
          const isActive = step === s.id;
          const isCompleted = step > s.id;
          return (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => isCompleted && setStep(s.id)}
                className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : isCompleted
                    ? "bg-green-50 text-green-600 cursor-pointer hover:bg-green-100"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <StepIcon className="w-5 h-5" />
                )}
                <span className="font-medium">{s.title}</span>
              </button>
              {idx < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${step > s.id ? "bg-green-400" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={onSubmit}>
        {/* Step 1: Destination */}
        {step === 1 && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Where are you going?</h2>
                <p className="text-sm text-gray-500">Tell us about your destination and travel dates</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Trip Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Give your trip a name
                </label>
                <input
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={onChange}
                  placeholder="e.g., Summer in Paris, Tokyo Adventure..."
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-gray-900 placeholder-gray-400"
                  required
                />
              </div>

              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="destination"
                    type="text"
                    value={form.destination}
                    onChange={onChange}
                    placeholder="e.g., Paris, France"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Dates and Travelers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Start Date
                  </label>
                  <input
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={onChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    End Date
                  </label>
                  <input
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={onChange}
                    min={form.startDate}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Travelers
                  </label>
                  <input
                    name="travelers"
                    type="number"
                    min="1"
                    max="50"
                    value={form.travelers}
                    onChange={onChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-gray-900"
                  />
                </div>
              </div>

              {/* Trip Summary Preview */}
              {form.destination && tripDays > 0 && (
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-indigo-700">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{form.destination}</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-700">
                      <Clock className="w-4 h-4" />
                      <span>{tripDays} {tripDays === 1 ? "day" : "days"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-pink-700">
                      <Users className="w-4 h-4" />
                      <span>{form.travelers} {form.travelers == 1 ? "traveler" : "travelers"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Budget */}
        {step === 2 && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Set Your Budget</h2>
                <p className="text-sm text-gray-500">We'll plan activities that fit your wallet</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Your Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Currency
                </label>
                <select
                  name="baseCurrency"
                  value={form.baseCurrency}
                  onChange={onChange}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-gray-900 cursor-pointer"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Currency
                </label>
                <select
                  name="walletCurrency"
                  value={form.walletCurrency}
                  onChange={onChange}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-gray-900 cursor-pointer"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget Amount */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Budget
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    {currencies.find(c => c.code === form.baseCurrency)?.symbol || "$"}
                  </span>
                  <input
                    name="walletBudget"
                    type="number"
                    min="0"
                    value={form.walletBudget}
                    onChange={onChange}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-2xl font-semibold text-gray-900"
                  />
                </div>
                {form.travelers > 1 && (
                  <p className="mt-2 text-sm text-gray-500">
                    ~{currencies.find(c => c.code === form.baseCurrency)?.symbol}{Math.round(form.walletBudget / form.travelers).toLocaleString()} per person
                  </p>
                )}
              </div>
            </div>

            {/* FX Rate */}
            {form.baseCurrency !== form.walletCurrency && (
              <div className="mt-6 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Exchange Rate</span>
                  <button
                    type="button"
                    onClick={onEstimateFx}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Get Current Rate
                  </button>
                </div>
                {rate && rate.rate ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">1 {rate.base}</span>
                      <span className="font-semibold text-gray-900">{rate.rate?.toFixed(4)} {rate.target}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Trip budget will be</span>
                        <span className="text-lg font-bold text-emerald-600">
                          {(form.walletBudget * rate.rate).toLocaleString(undefined, { maximumFractionDigits: 0 })} {rate.target}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Click to fetch the current exchange rate</p>
                )}
              </div>
            )}

            {/* Budget Tips */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                <p className="text-2xl font-bold text-emerald-600 mb-1">
                  {tripDays > 0 ? `${currencies.find(c => c.code === form.baseCurrency)?.symbol}${Math.round(form.walletBudget / tripDays).toLocaleString()}` : "-"}
                </p>
                <p className="text-xs text-emerald-700">per day</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
                <p className="text-2xl font-bold text-blue-600 mb-1">{tripDays || "-"}</p>
                <p className="text-xs text-blue-700">days</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-center">
                <p className="text-2xl font-bold text-purple-600 mb-1">{form.travelers}</p>
                <p className="text-xs text-purple-700">{form.travelers == 1 ? "traveler" : "travelers"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preferences */}
        {step === 3 && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Customize Your Experience</h2>
                <p className="text-sm text-gray-500">Help us tailor the perfect itinerary for you</p>
              </div>
            </div>

            {/* Pace Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                How do you like to travel?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paceOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = form.pace === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, pace: option.value }))}
                      className={`p-5 rounded-2xl border-2 text-left transition-all ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                        style={{ backgroundColor: option.bgColor }}
                      >
                        <Icon className="w-6 h-6" style={{ color: option.color }} />
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">{option.label}</p>
                      <p className="text-sm text-gray-500">{option.description}</p>
                      {isSelected && (
                        <div className="mt-3 flex items-center gap-1 text-indigo-600 text-sm font-medium">
                          <Check className="w-4 h-4" />
                          Selected
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                What are you interested in? <span className="text-gray-400 font-normal">(Select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {interestOptions.map((interest) => {
                  const Icon = interest.icon;
                  const isSelected = form.interests.includes(interest.value);
                  return (
                    <button
                      key={interest.value}
                      type="button"
                      onClick={() => toggleInterest(interest.value)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" style={{ color: isSelected ? interest.color : "#9ca3af" }} />
                      {interest.label}
                      {isSelected && <X className="w-3.5 h-3.5 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trip Summary */}
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plane className="w-5 h-5 text-indigo-600" />
                Trip Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Destination</p>
                  <p className="font-semibold text-gray-900">{form.destination || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Duration</p>
                  <p className="font-semibold text-gray-900">{tripDays ? `${tripDays} days` : "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Budget</p>
                  <p className="font-semibold text-gray-900">
                    {currencies.find(c => c.code === form.baseCurrency)?.symbol}{form.walletBudget.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Travelers</p>
                  <p className="font-semibold text-gray-900">{form.travelers} {form.travelers == 1 ? "person" : "people"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            type="button"
            onClick={onBack}
            disabled={step === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              step === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            {step < 3 ? (
              <button
                type="button"
                onClick={onNext}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all ${
                  canProceed()
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                {saving ? "Creating..." : "Create My Trip"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
