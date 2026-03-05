import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTrips } from "../../hooks/useTrips.js";
import { useFxRates } from "../../hooks/useFxRates.js";

const currencies = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "INR", name: "Indian Rupee" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "KRW", name: "South Korean Won" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "ZAR", name: "South African Rand" },
  { code: "AED", name: "UAE Dirham" },
  { code: "THB", name: "Thai Baht" },
  { code: "MYR", name: "Malaysian Ringgit" },
];

export default function NewTripPage() {
    // Loader state
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
    interests: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onNext = () => {
    if (step === 1 && (!form.title || !form.destination)) return;
    setStep((s) => s + 1);
  };

  const onBack = () => setStep((s) => s - 1);

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
      const walletTrip = await createWalletTrip({
        title: form.title,
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
        walletCurrency: form.walletCurrency,
        walletBudget: Number(form.walletBudget),
      });

      const interestsArray = form.interests
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await generateItinerary({
        tripId: walletTrip._id,
        destination: walletTrip.destination,
        startDate: walletTrip.startDate,
        endDate: walletTrip.endDate,
        walletCurrency: walletTrip.walletCurrency,
        walletBudget: walletTrip.walletBudget,
        pace: form.pace,
        interests: interestsArray,
      });

      navigate(`/dashboard/trip/${walletTrip._id}`);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to create trip and itinerary. Try again.";
      setError(errorMsg);
    } finally {
      setSaving(false);
      setShowLoader(false);
    }
  };

  if (showLoader) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh" }}>
        <div style={{ marginBottom: 24 }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, color: "#6366f1" }}>Planning your trip...</div>
        <div style={{ marginTop: 8, fontSize: 14, color: "#94a3b8" }}>Please wait while Beyondly creates your itinerary.</div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}
    >
      <header>
        <h2 style={{ margin: 0, fontSize: "1.5rem" }}>New trip</h2>
        <p style={{ marginTop: 4, fontSize: 13, color: "var(--text-soft)" }}>
          Set your destination, wallet, and preferences. Beyondly will ask Gemini to build
          an itinerary that stays within your budget.
        </p>
      </header>

      <section
        style={{
          borderRadius: 20,
          padding: "1rem 1.1rem",
          border: "1px solid rgba(148,163,184,0.35)",
          backgroundColor: "rgba(15,23,42,0.9)",
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
          gap: "1.1rem",
        }}
      >
        <div>
          <label
            htmlFor="title"
            style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}
          >
            Trip title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="input-field"
            value={form.title}
            onChange={onChange}
            placeholder="Summer in Lisbon"
            required
          />
        </div>
        <div>
          <label
            htmlFor="destination"
            style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}
          >
            Destination
          </label>
          <input
            id="destination"
            name="destination"
            type="text"
            className="input-field"
            value={form.destination}
            onChange={onChange}
            placeholder="Lisbon, Portugal"
            required
          />
        </div>
        <div>
          <label
            htmlFor="startDate"
            style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}
          >
            Start date
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            className="input-field"
            value={form.startDate}
            onChange={onChange}
          />
        </div>
        <div>
          <label
            htmlFor="endDate"
            style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}
          >
            End date
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            className="input-field"
            value={form.endDate}
            onChange={onChange}
          />
        </div>
      </section>

      <section
        style={{
          borderRadius: 20,
          padding: "1rem 1.1rem",
          border: "1px solid rgba(148,163,184,0.35)",
          backgroundColor: "rgba(15,23,42,0.9)",
          display: "grid",
          gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)",
          gap: "1.1rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
          <div>
            <label
              htmlFor="walletCurrency"
              style={{
                fontSize: 13,
                fontWeight: 500,
                display: "block",
                marginBottom: 4,
              }}
            >
              Wallet currency
            </label>
            <select
              id="walletCurrency"
              name="walletCurrency"
              className="input-field"
              value={form.walletCurrency}
              onChange={onChange}
              style={{ cursor: "pointer" }}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="walletBudget"
              style={{
                fontSize: 13,
                fontWeight: 500,
                display: "block",
                marginBottom: 4,
              }}
            >
              Amount to exchange / budget
            </label>
            <input
              id="walletBudget"
              name="walletBudget"
              type="number"
              min="0"
              className="input-field"
              value={form.walletBudget}
              onChange={onChange}
            />
            {rate && rate.rate && (
              <div style={{ marginTop: 6, fontSize: 13, color: "var(--text-soft)" }}>
                {form.walletBudget} {rate.base} ≈ {(form.walletBudget * rate.rate).toLocaleString(undefined, { maximumFractionDigits: 2 })} {rate.target}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <div>
            <label
              htmlFor="baseCurrency"
              style={{
                fontSize: 13,
                fontWeight: 500,
                display: "block",
                marginBottom: 4,
              }}
            >
              Your current currency
            </label>
            <select
              id="baseCurrency"
              name="baseCurrency"
              className="input-field"
              value={form.baseCurrency}
              onChange={onChange}
              style={{ cursor: "pointer" }}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn-outline"
            onClick={onEstimateFx}
            style={{ marginTop: 4, alignSelf: "flex-start" }}
          >
            View FX rate and hints
          </button>
          {rate && (
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                color: "var(--text-soft)",
              }}
            >
              1 {rate.base} ≈ {rate.rate?.toFixed(3)} {rate.target}
            </div>
          )}
        </div>
      </section>

      <section
        style={{
          borderRadius: 20,
          padding: "1rem 1.1rem",
          border: "1px solid rgba(148,163,184,0.35)",
          backgroundColor: "rgba(15,23,42,0.9)",
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
          gap: "1.1rem",
        }}
      >
        <div>
          <label
            htmlFor="pace"
            style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}
          >
            Trip pace
          </label>
          <select
            id="pace"
            name="pace"
            className="input-field"
            value={form.pace}
            onChange={onChange}
          >
            <option value="relaxed">Relaxed</option>
            <option value="balanced">Balanced</option>
            <option value="full">Full days</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="interests"
            style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}
          >
            Interests (comma separated)
          </label>
          <input
            id="interests"
            name="interests"
            type="text"
            className="input-field"
            value={form.interests}
            onChange={onChange}
            placeholder="food, history, viewpoints"
          />
        </div>
      </section>

      {error && (
        <div
          style={{
            borderRadius: 999,
            padding: "0.55rem 0.9rem",
            fontSize: 12,
            color: "var(--danger)",
            backgroundColor: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.5)",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <button
          type="button"
          className="btn-outline"
          onClick={onBack}
          disabled={step === 1}
        >
          Back
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          {step < 2 && (
            <button type="button" className="btn-outline" onClick={onNext}>
              Next
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Planning trip..." : "Create trip and plan"}
          </button>
        </div>
      </div>
    </form>
  );
}

