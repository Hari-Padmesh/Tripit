import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTrips } from "../../hooks/useTrips.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useFxRates } from "../../hooks/useFxRates.js";
import { Calendar, MapPin, Wallet, TrendingUp, ChevronRight, Plane, Plus, Clock, Users, Trash2, X, AlertTriangle } from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Currency symbols map
const currencySymbols = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹", JPY: "¥", CAD: "C$", AUD: "A$",
  CHF: "CHF", CNY: "¥", SGD: "S$", AED: "د.إ", MXN: "$", BRL: "R$", KRW: "₩", THB: "฿"
};

export default function TripsHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trips, fetchMonthlySummary, deleteTrip } = useTrips();
  const { allRates, fetchAllRates, convert } = useFxRates();
  const [summary, setSummary] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [tripToDelete, setTripToDelete] = useState(null);

  const handleDeleteClick = (trip, e) => {
    e.stopPropagation();
    setTripToDelete(trip);
  };

  const handleConfirmDelete = async () => {
    if (!tripToDelete) return;
    try {
      setDeletingId(tripToDelete._id);
      await deleteTrip(tripToDelete._id);
      setTripToDelete(null);
    } catch (err) {
      console.error("Failed to delete trip:", err);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchMonthlySummary()
      .then(setSummary)
      .catch(() => setSummary([]));
  }, [fetchMonthlySummary]);

  // Fetch exchange rates on mount for conversion
  useEffect(() => {
    const homeCurrency = user?.preferredCurrency || "USD";
    fetchAllRates(homeCurrency);
  }, [user?.preferredCurrency, fetchAllRates]);

  // Calculate converted totals
  const convertedTotals = useMemo(() => {
    const homeCurrency = user?.preferredCurrency || "USD";
    
    const totalBudget = trips.reduce((sum, t) => {
      const budget = t.walletBudget || 0;
      const tripCurrency = t.walletCurrency || "USD";
      if (tripCurrency === homeCurrency || !allRates?.rates) {
        return sum + budget;
      }
      return sum + convert(budget, tripCurrency, allRates);
    }, 0);

    const totalSpent = trips.reduce((sum, t) => {
      const spent = t.walletSpent || 0;
      const tripCurrency = t.walletCurrency || "USD";
      if (tripCurrency === homeCurrency || !allRates?.rates) {
        return sum + spent;
      }
      return sum + convert(spent, tripCurrency, allRates);
    }, 0);

    return {
      totalBudget: Math.round(totalBudget * 100) / 100,
      totalSpent: Math.round(totalSpent * 100) / 100,
      symbol: currencySymbols[homeCurrency] || "$"
    };
  }, [trips, allRates, convert, user?.preferredCurrency]);

  // Group trips by month/year with currency conversion
  const tripsByMonth = useMemo(() => {
    const homeCurrency = user?.preferredCurrency || "USD";
    const grouped = {};
    trips.forEach((trip) => {
      const date = new Date(trip.startDate || Date.now());
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!grouped[key]) {
        grouped[key] = {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          monthName: MONTH_NAMES[date.getMonth()],
          trips: [],
          totalBudget: 0,
          totalSpent: 0,
        };
      }
      grouped[key].trips.push(trip);
      
      // Convert budget and spent to home currency
      const tripCurrency = trip.walletCurrency || "USD";
      const budget = trip.walletBudget || 0;
      const spent = trip.walletSpent || 0;
      
      if (tripCurrency === homeCurrency || !allRates?.rates) {
        grouped[key].totalBudget += budget;
        grouped[key].totalSpent += spent;
      } else {
        grouped[key].totalBudget += convert(budget, tripCurrency, allRates);
        grouped[key].totalSpent += convert(spent, tripCurrency, allRates);
      }
    });
    // Sort by most recent month first (descending)
    return Object.values(grouped).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [trips, allRates, convert, user?.preferredCurrency]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Trip History</h1>
          <p className="text-gray-500 text-sm">
            Browse your adventures organized by month
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

      {/* Stats Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Plane className="w-5 h-5 text-violet-600" />
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
                {convertedTotals.symbol}{convertedTotals.totalBudget.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Total Budget</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {convertedTotals.symbol}{convertedTotals.totalSpent.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Total Spent</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(trips.map(t => t.destination)).size}
              </p>
              <p className="text-xs text-gray-500">Destinations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Trips List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly Spending Overview */}
          {tripsByMonth.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="font-semibold text-gray-900">Monthly Spending</h2>
              </div>
              <div className="space-y-4">
                {tripsByMonth.slice(0, 6).map((row, idx) => {
                  const maxSpent = Math.max(...tripsByMonth.map(s => s.totalSpent || 1));
                  const percentage = ((row.totalSpent || 0) / maxSpent) * 100;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          {row.monthName} {row.year}
                        </span>
                        <span className="font-medium text-gray-900">
                          {convertedTotals.symbol}{Math.round(row.totalSpent).toLocaleString()} <span className="text-gray-400">{user?.preferredCurrency || "USD"}</span>
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trips by Month */}
          <div className="space-y-6">
            {tripsByMonth.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 border border-gray-200 shadow-sm text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Plane className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-4">No trips yet. Start planning your first adventure!</p>
                <button
                  onClick={() => navigate("/dashboard/trip/new")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create New Trip
                </button>
              </div>
            ) : (
              tripsByMonth.map((group) => (
                <div key={`${group.year}-${group.month}`} className="space-y-3">
                  {/* Month Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <h3 className="font-semibold text-gray-900">{group.monthName} {group.year}</h3>
                      <span className="text-xs text-gray-500 px-2 py-1 rounded-lg bg-gray-100">
                        {group.trips.length} trip{group.trips.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      Budget: <span className="text-gray-900">${group.totalBudget.toLocaleString()}</span>
                    </span>
                  </div>

                  {/* Trip Cards */}
                  <div className="space-y-3">
                    {group.trips.map((trip) => (
                      <div
                        key={trip._id}
                        className="w-full text-left bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:border-blue-500/50 hover:shadow-md transition-all group"
                      >
                        <div 
                          onClick={() => navigate(`/dashboard/trip/${trip._id}`)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate mb-1">{trip.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {trip.destination}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "No date"}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5" />
                                  {trip.travelers || 1} traveler{(trip.travelers || 1) !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                        
                        {/* Budget Progress */}
                        {trip.walletBudget > 0 && (
                          <div className="bg-gray-50 rounded-xl p-3">
                            <div className="flex justify-between text-xs mb-2">
                              <span className="text-gray-500">Budget Used</span>
                              <span className="text-gray-900">
                                ${trip.walletSpent || 0} / ${trip.walletBudget} {trip.walletCurrency || "USD"}
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  ((trip.walletSpent || 0) / trip.walletBudget) > 0.9
                                    ? "bg-red-500"
                                    : ((trip.walletSpent || 0) / trip.walletBudget) > 0.7
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{
                                  width: `${Math.min(((trip.walletSpent || 0) / trip.walletBudget) * 100, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                        </div>
                        
                        {/* Delete Button - appears on hover at bottom */}
                        <div className="flex justify-end mt-3 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleDeleteClick(trip, e)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Trip
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Recent Trips</h3>
            </div>
            <div className="space-y-3">
              {trips.slice(0, 5).map((trip) => (
                <button
                  key={trip._id}
                  onClick={() => navigate(`/dashboard/trip/${trip._id}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{trip.title}</p>
                    <p className="text-xs text-gray-500">{trip.destination}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
              {trips.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No recent trips</p>
              )}
            </div>
          </div>

          {/* Top Destinations */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Top Destinations</h3>
            </div>
            <div className="space-y-2">
              {[...new Set(trips.map(t => t.destination))].slice(0, 5).map((dest, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <span className="text-sm text-gray-900">{dest}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-lg">
                    {trips.filter(t => t.destination === dest).length} trips
                  </span>
                </div>
              ))}
              {trips.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No destinations yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {tripToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setTripToDelete(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setTripToDelete(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Trip</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-1">{tripToDelete.title}</h4>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {tripToDelete.destination}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {tripToDelete.startDate ? new Date(tripToDelete.startDate).toLocaleDateString() : "No date"}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setTripToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingId === tripToDelete._id}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingId === tripToDelete._id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Trip
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

