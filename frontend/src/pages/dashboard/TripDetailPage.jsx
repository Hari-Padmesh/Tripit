import { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTrips } from "../../hooks/useTrips.js";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Wallet, 
  Sparkles,
  Navigation,
  Star,
  RefreshCw,
  Camera,
  Landmark,
  Utensils,
  TreePine,
  ShoppingBag,
  Music,
  Dumbbell,
  Plane,
  Building2,
  Palmtree,
  Coffee,
  Footprints,
  Users
} from "lucide-react";

// Category icon mapping with colors
const categoryConfig = {
  "sightseeing": { icon: Camera, bg: "#dbeafe", color: "#2563eb" },
  "culture": { icon: Landmark, bg: "#fae8ff", color: "#a855f7" },
  "culture & education": { icon: Landmark, bg: "#fae8ff", color: "#a855f7" },
  "food": { icon: Utensils, bg: "#fed7aa", color: "#ea580c" },
  "food & dining": { icon: Utensils, bg: "#fed7aa", color: "#ea580c" },
  "dining": { icon: Coffee, bg: "#fed7aa", color: "#ea580c" },
  "nature": { icon: TreePine, bg: "#dcfce7", color: "#16a34a" },
  "outdoor": { icon: Footprints, bg: "#dcfce7", color: "#16a34a" },
  "shopping": { icon: ShoppingBag, bg: "#fef3c7", color: "#d97706" },
  "entertainment": { icon: Music, bg: "#fce7f3", color: "#db2777" },
  "wellness": { icon: Dumbbell, bg: "#ccfbf1", color: "#0d9488" },
  "transport": { icon: Plane, bg: "#e0e7ff", color: "#4f46e5" },
  "accommodation": { icon: Building2, bg: "#f3e8ff", color: "#9333ea" },
  "relaxation": { icon: Palmtree, bg: "#cffafe", color: "#0891b2" },
  "default": { icon: MapPin, bg: "#f3f4f6", color: "#6b7280" }
};

// Get category config based on category string
const getCategoryConfig = (category) => {
  if (!category) return categoryConfig.default;
  const key = category.toLowerCase();
  for (const [cat, config] of Object.entries(categoryConfig)) {
    if (key.includes(cat) || cat.includes(key)) {
      return config;
    }
  }
  return categoryConfig.default;
};

// Day themes based on index
const dayThemes = [
  { title: "Iconic Landmarks & Historic Charms", color: "#6366f1" },
  { title: "Cultural Immersion & Local Flavors", color: "#8b5cf6" },
  { title: "Nature & Scenic Adventures", color: "#10b981" },
  { title: "Hidden Gems & Local Discoveries", color: "#f59e0b" },
  { title: "Relaxation & Farewell Moments", color: "#ec4899" },
];

export default function TripDetailPage() {
  const { tripId } = useParams();
  const { trips, generateItinerary } = useTrips();
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [expandedDays, setExpandedDays] = useState({});

  const trip = useMemo(
    () => trips.find((t) => t._id === tripId),
    [trips, tripId],
  );

  // Initialize all days as expanded
  useEffect(() => {
    if (trip?.itinerary) {
      const expanded = {};
      trip.itinerary.forEach((_, idx) => {
        expanded[idx] = true;
      });
      setExpandedDays(expanded);
    }
  }, [trip?.itinerary?.length]);

  if (!trip) {
    return (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "60vh",
        color: "#6b7280"
      }}>
        <p>Trip not found.</p>
      </div>
    );
  }

  const totalSpent =
    trip.itinerary?.reduce(
      (sum, day) =>
        sum + (day.activities || []).reduce((s, a) => s + (a.cost || 0), 0),
      0,
    ) || 0;

  const remaining = Math.max(trip.walletBudget - totalSpent, 0);
  const daysCount = trip.itinerary?.length || 0;

  const toggleDay = (idx) => {
    setExpandedDays(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleGenerateItinerary = async () => {
    setGenerating(true);
    setGenError("");
    try {
      await generateItinerary({
        tripId: trip._id,
        destination: trip.destination,
        startDate: trip.startDate || new Date().toISOString(),
        endDate: trip.endDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        walletCurrency: trip.walletCurrency,
        walletBudget: trip.walletBudget,
        pace: "balanced",
        interests: [],
        travelers: trip.travelers || 1,
      });
    } catch (err) {
      console.error("Failed to generate itinerary:", err);
      setGenError(err.response?.data?.error || "Failed to generate itinerary. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Flexible";
    return new Date(dateStr).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Hero Section */}
      <div
        style={{
          position: "relative",
          height: 280,
          borderRadius: 24,
          overflow: "hidden",
          marginBottom: 24,
        }}
      >
        <img
          src="/preview16.jpg"
          alt={trip.destination}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "24px 32px",
            color: "#fff",
          }}
        >
          <h1 style={{ 
            margin: 0, 
            fontSize: "2.5rem", 
            fontWeight: 700,
            textShadow: "0 2px 8px rgba(0,0,0,0.3)"
          }}>
            {trip.destination}
          </h1>
          <p style={{ 
            margin: "8px 0 0", 
            fontSize: 15, 
            opacity: 0.95,
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap"
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Calendar size={14} />
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Wallet size={14} />
              {trip.walletBudget} {trip.walletCurrency}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Users size={14} />
              {trip.travelers || 1} traveler{(trip.travelers || 1) !== 1 ? 's' : ''}
            </span>
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="trip-detail-grid">
        {/* Left Column - Daily Plan */}
        <div>
          {/* Section Header */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 12, 
            marginBottom: 20 
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Calendar size={20} color="#fff" />
            </div>
            <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600, color: "#1f2937" }}>
              Your Daily Plan
            </h2>
          </div>

          {/* Itinerary Content */}
          {trip.itinerary && trip.itinerary.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {trip.itinerary.map((day, dayIdx) => {
                const theme = dayThemes[dayIdx % dayThemes.length];
                const isExpanded = expandedDays[dayIdx];
                
                return (
                  <div
                    key={dayIdx}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 20,
                      border: "1px solid #e5e7eb",
                      overflow: "hidden",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                    }}
                  >
                    {/* Day Header */}
                    <button
                      onClick={() => toggleDay(dayIdx)}
                      style={{
                        width: "100%",
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        borderBottom: isExpanded ? "1px solid #e5e7eb" : "none"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: theme.color
                        }} />
                        <span style={{ 
                          fontSize: 16, 
                          fontWeight: 600, 
                          color: "#1f2937" 
                        }}>
                          Day {dayIdx + 1}: {theme.title}
                        </span>
                        <span style={{
                          fontSize: 13,
                          color: "#6b7280",
                          marginLeft: 8
                        }}>
                          {day.date ? new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : ""}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={20} color="#6b7280" />
                      ) : (
                        <ChevronDown size={20} color="#6b7280" />
                      )}
                    </button>

                    {/* Activities Timeline */}
                    {isExpanded && (
                      <div style={{ padding: "16px 20px" }}>
                        {day.activities && day.activities.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            {day.activities.map((act, actIdx) => (
                              <div key={actIdx} style={{ display: "flex", gap: 16 }}>
                                {/* Timeline Indicator */}
                                <div style={{ 
                                  display: "flex", 
                                  flexDirection: "column", 
                                  alignItems: "center",
                                  minWidth: 40
                                }}>
                                  <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    backgroundColor: "#dcfce7",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                  }}>
                                    <Clock size={16} color="#16a34a" />
                                  </div>
                                  {actIdx < day.activities.length - 1 && (
                                    <div style={{
                                      width: 2,
                                      flex: 1,
                                      minHeight: 40,
                                      backgroundColor: "#e5e7eb",
                                      marginTop: 8
                                    }} />
                                  )}
                                </div>

                                {/* Activity Content */}
                                <div style={{ flex: 1 }}>
                                  {/* Time & Travel Info */}
                                  <div style={{ marginBottom: 8 }}>
                                    <span style={{ 
                                      fontSize: 14, 
                                      fontWeight: 600, 
                                      color: "#1f2937" 
                                    }}>
                                      {act.timeOfDay || `Activity ${actIdx + 1}`}
                                    </span>
                                    {act.category && (
                                      <span style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                        marginLeft: 12,
                                        fontSize: 12,
                                        color: "#6b7280"
                                      }}>
                                        <Navigation size={12} />
                                        {act.category}
                                      </span>
                                    )}
                                  </div>

                                  {/* Activity Card */}
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 16,
                                      padding: 12,
                                      backgroundColor: "#f9fafb",
                                      borderRadius: 16,
                                      transition: "all 0.2s ease",
                                      cursor: "pointer"
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = "#f3f4f6";
                                      e.currentTarget.style.transform = "translateX(4px)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = "#f9fafb";
                                      e.currentTarget.style.transform = "translateX(0)";
                                    }}
                                  >
                                    {/* Activity Icon */}
                                    {(() => {
                                      const config = getCategoryConfig(act.category);
                                      const IconComponent = config.icon;
                                      return (
                                        <div
                                          style={{
                                            width: 100,
                                            height: 100,
                                            borderRadius: 12,
                                            backgroundColor: config.bg,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0
                                          }}
                                        >
                                          <IconComponent size={40} color={config.color} />
                                        </div>
                                      );
                                    })()}

                                    {/* Activity Details */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ 
                                        display: "flex", 
                                        alignItems: "center", 
                                        gap: 8,
                                        marginBottom: 6
                                      }}>
                                        <h4 style={{ 
                                          margin: 0, 
                                          fontSize: 15, 
                                          fontWeight: 600,
                                          color: "#1f2937"
                                        }}>
                                          {act.title}
                                        </h4>
                                        <span style={{
                                          fontSize: 12,
                                          color: "#6b7280",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 2
                                        }}>
                                          <Wallet size={12} />
                                          {act.cost || 0}
                                        </span>
                                      </div>
                                      <p style={{ 
                                        margin: 0, 
                                        fontSize: 13, 
                                        color: "#6b7280",
                                        lineHeight: 1.5,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden"
                                      }}>
                                        {act.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ 
                            textAlign: "center", 
                            padding: "24px",
                            color: "#9ca3af"
                          }}>
                            <MapPin size={24} style={{ marginBottom: 8 }} />
                            <p style={{ margin: 0, fontSize: 14 }}>
                              No activities planned for this day yet.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              border: "1px solid #e5e7eb",
              padding: "48px 24px",
              textAlign: "center"
            }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <Calendar size={28} color="#9ca3af" />
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: 18, color: "#1f2937" }}>
                No Itinerary Yet
              </h3>
              <p style={{ 
                margin: "0 0 24px", 
                fontSize: 14, 
                color: "#6b7280",
                maxWidth: 360,
                marginLeft: "auto",
                marginRight: "auto"
              }}>
                Generate an AI-powered itinerary with personalized activities, 
                timings, and budget estimates for your trip.
              </p>
              {genError && (
                <p style={{ 
                  fontSize: 13, 
                  color: "#ef4444", 
                  marginBottom: 16,
                  padding: "8px 16px",
                  backgroundColor: "#fef2f2",
                  borderRadius: 8,
                  display: "inline-block"
                }}>
                  {genError}
                </p>
              )}
              <button
                onClick={handleGenerateItinerary}
                disabled={generating}
                style={{
                  padding: "12px 24px",
                  borderRadius: 12,
                  border: "none",
                  background: generating 
                    ? "linear-gradient(135deg, #a5b4fc, #c4b5fd)" 
                    : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: generating ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                  transition: "all 0.2s ease"
                }}
              >
                {generating ? (
                  <>
                    <RefreshCw size={18} style={{ animation: "spin 1s linear infinite" }} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate AI Itinerary
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Trip Overview Card */}
          <div style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}>
            <div style={{ 
              padding: "16px 20px",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              gap: 10
            }}>
              <Star size={18} color="#f59e0b" fill="#f59e0b" />
              <span style={{ fontSize: 15, fontWeight: 600, color: "#1f2937" }}>
                Trip Overview
              </span>
            </div>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                  Destination
                </div>
                <div style={{ 
                  fontSize: 16, 
                  fontWeight: 600, 
                  color: "#1f2937",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}>
                  <MapPin size={16} color="#6366f1" />
                  {trip.destination}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                  Duration
                </div>
                <div style={{ fontSize: 14, color: "#1f2937" }}>
                  {daysCount} {daysCount === 1 ? "day" : "days"}
                  <span style={{ color: "#6b7280", marginLeft: 8 }}>
                    ({formatDate(trip.startDate)} - {formatDate(trip.endDate)})
                  </span>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                  Activities
                </div>
                <div style={{ fontSize: 14, color: "#1f2937" }}>
                  {trip.itinerary?.reduce((sum, day) => sum + (day.activities?.length || 0), 0) || 0} planned
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                  Travelers
                </div>
                <div style={{ 
                  fontSize: 14, 
                  color: "#1f2937",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}>
                  <Users size={16} color="#8b5cf6" />
                  {trip.travelers || 1} {(trip.travelers || 1) === 1 ? "person" : "people"}
                </div>
              </div>
            </div>
          </div>

          {/* Budget Card */}
          <div style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}>
            <div style={{ 
              padding: "16px 20px",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              gap: 10
            }}>
              <Wallet size={18} color="#10b981" />
              <span style={{ fontSize: 15, fontWeight: 600, color: "#1f2937" }}>
                Budget Tracker
              </span>
            </div>
            <div style={{ padding: "16px 20px" }}>
              {/* Budget Progress Bar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between",
                  marginBottom: 8
                }}>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>Planned</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1f2937" }}>
                    {totalSpent.toFixed(0)} / {trip.walletBudget} {trip.walletCurrency}
                  </span>
                </div>
                <div style={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#e5e7eb",
                  overflow: "hidden"
                }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.min((totalSpent / trip.walletBudget) * 100, 100)}%`,
                    borderRadius: 4,
                    background: totalSpent > trip.walletBudget 
                      ? "linear-gradient(90deg, #ef4444, #f87171)"
                      : "linear-gradient(90deg, #10b981, #34d399)",
                    transition: "width 0.3s ease"
                  }} />
                </div>
              </div>

              {/* Budget Stats */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr",
                gap: 12
              }}>
                <div style={{
                  padding: 12,
                  backgroundColor: "#f0fdf4",
                  borderRadius: 12,
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#16a34a" }}>
                    {remaining.toFixed(0)}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    {trip.walletCurrency} Remaining
                  </div>
                </div>
                <div style={{
                  padding: 12,
                  backgroundColor: "#fef3c7",
                  borderRadius: 12,
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#d97706" }}>
                    {trip.walletBudget ? Math.round((totalSpent / trip.walletBudget) * 100) : 0}%
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    Budget Used
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Summary Card */}
          {trip.aiSummary && (
            <div style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              border: "1px solid #e5e7eb",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
              <div style={{ 
                padding: "16px 20px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                gap: 10
              }}>
                <Sparkles size={18} color="#8b5cf6" />
                <span style={{ fontSize: 15, fontWeight: 600, color: "#1f2937" }}>
                  AI Insights
                </span>
              </div>
              <div style={{ padding: "16px 20px" }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: 14, 
                  color: "#4b5563",
                  lineHeight: 1.6
                }}>
                  {trip.aiSummary}
                </p>
              </div>
            </div>
          )}

          {/* Regenerate Button */}
          {trip.itinerary && trip.itinerary.length > 0 && (
            <button
              onClick={handleGenerateItinerary}
              disabled={generating}
              style={{
                width: "100%",
                padding: "12px 20px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                backgroundColor: generating ? "#f3f4f6" : "#fff",
                color: generating ? "#9ca3af" : "#6366f1",
                fontSize: 14,
                fontWeight: 500,
                cursor: generating ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s ease"
              }}
            >
              <RefreshCw size={16} style={generating ? { animation: "spin 1s linear infinite" } : {}} />
              {generating ? "Regenerating..." : "Regenerate Itinerary"}
            </button>
          )}
        </div>
      </div>

      {/* Keyframe animation for spinner and responsive styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .trip-detail-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
        }
        @media (max-width: 900px) {
          .trip-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

