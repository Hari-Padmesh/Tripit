import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTrips } from "../../hooks/useTrips.js";
import { Calendar, MapPin, Wallet, TrendingUp, ChevronRight, Plane, Plus, Clock, Users } from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function TripsHistoryPage() {
  const navigate = useNavigate();
  const { trips, fetchMonthlySummary } = useTrips();
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    fetchMonthlySummary()
      .then(setSummary)
      .catch(() => setSummary([]));
  }, [fetchMonthlySummary]);

  // Group trips by month/year
  const tripsByMonth = useMemo(() => {
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
      grouped[key].totalBudget += trip.walletBudget || 0;
      grouped[key].totalSpent += trip.walletSpent || 0;
    });
    // Sort by most recent month first (descending)
    return Object.values(grouped).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [trips]);

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
                ${trips.reduce((sum, t) => sum + (t.walletBudget || 0), 0).toLocaleString()}
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
                ${trips.reduce((sum, t) => sum + (t.walletSpent || 0), 0).toLocaleString()}
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
          {summary.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="font-semibold text-gray-900">Monthly Spending</h2>
              </div>
              <div className="space-y-4">
                {summary.slice(0, 6).map((row, idx) => {
                  const maxSpent = Math.max(...summary.map(s => s.totalSpent || 1));
                  const percentage = ((row.totalSpent || 0) / maxSpent) * 100;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          {MONTH_NAMES[row._id.month - 1]} {row._id.year}
                        </span>
                        <span className="font-medium text-gray-900">
                          ${row.totalSpent?.toFixed(0) || 0} <span className="text-gray-400">{row.currency || "USD"}</span>
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
                      <button
                        key={trip._id}
                        onClick={() => navigate(`/dashboard/trip/${trip._id}`)}
                        className="w-full text-left bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:border-blue-500/50 hover:shadow-md transition-all group"
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
                      </button>
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
    </div>
  );
}

