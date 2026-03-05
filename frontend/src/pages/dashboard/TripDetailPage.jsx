import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTrips } from "../../hooks/useTrips.js";

export default function TripDetailPage() {
  const { tripId } = useParams();
  const { trips, generateItinerary } = useTrips();
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  const trip = useMemo(
    () => trips.find((t) => t._id === tripId),
    [trips, tripId],
  );

  if (!trip) {
    return <p style={{ fontSize: 13, color: "var(--text-soft)" }}>Trip not found.</p>;
  }

  const totalSpent =
    trip.itinerary?.reduce(
      (sum, day) =>
        sum +
        (day.activities || []).reduce((s, a) => s + (a.cost || 0), 0),
      0,
    ) || 0;

  const remaining = Math.max(trip.walletBudget - totalSpent, 0);

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
      });
    } catch (err) {
      console.error("Failed to generate itinerary:", err);
      setGenError(err.response?.data?.error || "Failed to generate itinerary. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
      <header>
        <h2 style={{ margin: 0, fontSize: "1.5rem" }}>{trip.title}</h2>
        <p style={{ marginTop: 4, fontSize: 13, color: "var(--text-soft)" }}>
          {trip.destination} ·{" "}
          {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "Flexible"}{" "}
          to{" "}
          {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : "Flexible"}
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
          gap: "1.1rem",
        }}
      >
        <div
          style={{
            borderRadius: 18,
            padding: "0.9rem 1rem",
            border: "1px solid rgba(148,163,184,0.35)",
            backgroundColor: "rgba(15,23,42,0.9)",
          }}
        >
          <div style={{ fontSize: 11, color: "var(--text-soft)" }}>Wallet</div>
          <div style={{ marginTop: 4, fontSize: 13 }}>
            Budget: {trip.walletBudget} {trip.walletCurrency}
          </div>
          <div style={{ marginTop: 4, fontSize: 13 }}>
            Planned spend: {totalSpent.toFixed(0)} {trip.walletCurrency}
          </div>
          <div style={{ marginTop: 4, fontSize: 13 }}>
            Remaining: {remaining.toFixed(0)} {trip.walletCurrency}
          </div>
        </div>
        <div
          style={{
            borderRadius: 18,
            padding: "0.9rem 1rem",
            border: "1px solid rgba(148,163,184,0.35)",
            backgroundColor: "rgba(15,23,42,0.9)",
          }}
        >
          <div style={{ fontSize: 11, color: "var(--text-soft)" }}>Summary</div>
          <p style={{ marginTop: 6, fontSize: 13, color: "var(--text-soft)" }}>
            {trip.aiSummary ||
              "Generate an itinerary to see the AI trip summary with highlights and budget guidance."}
          </p>
        </div>
      </section>

      <section
        className="subtle-scroll"
        style={{
          borderRadius: 18,
          padding: "0.9rem 1rem",
          border: "1px solid rgba(148,163,184,0.35)",
          backgroundColor: "rgba(15,23,42,0.9)",
          maxHeight: 420,
          overflowY: "auto",
        }}
      >
        {trip.itinerary && trip.itinerary.length > 0 ? (
          <div style={{ fontSize: 14 }}>
            {trip.itinerary.map((day, idx) => (
              <div key={idx} style={{ marginBottom: "1.2rem" }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>
                  {day.label || `Day ${idx + 1}`} ({day.date ? new Date(day.date).toLocaleDateString() : ""})
                </div>
                {(day.activities && day.activities.length > 0) ? (
                  <ol style={{ marginLeft: 18 }}>
                    {day.activities.map((act, aIdx) => (
                      <li key={aIdx} style={{ marginBottom: 8 }}>
                        <span style={{ fontWeight: 500 }}>{act.title}</span>
                        {act.description && (
                          <span style={{ color: "var(--text-soft)", marginLeft: 6 }}>
                            – {act.description}
                          </span>
                        )}
                        <div style={{ marginLeft: 6, fontSize: 13 }}>
                          <span>Category: {act.category || "N/A"}</span> | <span>Time: {act.timeOfDay || "N/A"}</span> | <span>Cost: {act.cost != null ? act.cost.toFixed(0) : "0"} {act.currency || trip.walletCurrency}</span>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div style={{ color: "var(--text-soft)", fontSize: 13, marginLeft: 18 }}>
                    No activities planned for this day.
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
            <p style={{ fontSize: 13, color: "var(--text-soft)", marginBottom: "1rem" }}>
              No itinerary has been generated yet for this trip.
            </p>
            {genError && (
              <p style={{ fontSize: 12, color: "#f87171", marginBottom: "1rem" }}>
                {genError}
              </p>
            )}
            <button
              onClick={handleGenerateItinerary}
              disabled={generating}
              style={{
                padding: "0.6rem 1.2rem",
                borderRadius: 12,
                border: "none",
                backgroundColor: generating ? "rgba(99,102,241,0.5)" : "rgba(99,102,241,0.8)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                cursor: generating ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {generating ? (
                <>
                  <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  Generating...
                </>
              ) : (
                "✨ Generate AI Itinerary"
              )}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

