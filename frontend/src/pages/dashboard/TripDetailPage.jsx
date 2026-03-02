import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTrips } from "../../hooks/useTrips.js";

export default function TripDetailPage() {
  const { tripId } = useParams();
  const { trips } = useTrips();

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
            This view shows the Gemini-generated itinerary with activities, categories,
            and their estimated costs so you can see how the wallet is used per day.
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: "0.9rem",
            }}
          >
            {trip.itinerary.map((day, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: 16,
                  padding: "0.8rem 0.9rem",
                  border: "1px solid rgba(148,163,184,0.35)",
                  backgroundColor: "rgba(15,23,42,0.95)",
                }}
              >
                <div style={{ fontSize: 11, color: "var(--text-soft)" }}>
                  {day.label || `Day ${idx + 1}`}
                </div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>
                  {day.date ? new Date(day.date).toLocaleDateString() : ""}
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    margin: "0.5rem 0 0",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    fontSize: 12,
                  }}
                >
                  {(day.activities || []).map((act, aIdx) => (
                    <li
                      key={aIdx}
                      style={{
                        borderRadius: 12,
                        padding: "0.4rem 0.5rem",
                        backgroundColor: "rgba(15,23,42,0.9)",
                        border: "1px solid rgba(148,163,184,0.3)",
                      }}
                    >
                      <div style={{ fontWeight: 500 }}>{act.title}</div>
                      <div
                        style={{
                          marginTop: 2,
                          color: "var(--text-soft)",
                          fontSize: 11,
                        }}
                      >
                        {act.description}
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 11,
                        }}
                      >
                        <span>{act.category}</span>
                        <span>
                          {act.cost?.toFixed(0)} {act.currency || trip.walletCurrency}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "var(--text-soft)" }}>
            No itinerary has been generated yet for this trip.
          </p>
        )}
      </section>
    </div>
  );
}

