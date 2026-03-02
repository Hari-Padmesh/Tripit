import { useTranslate } from "../../hooks/useTranslate.js";

export default function TranslatePage() {
  const { text, targetLang, setTargetLang, translated, loading, onChangeText } =
    useTranslate("en");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
      <header>
        <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Translate</h2>
        <p style={{ marginTop: 4, fontSize: 13, color: "var(--text-soft)" }}>
          Type any sentence and translate it into the language you need for your trip.
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
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label
            htmlFor="sourceText"
            style={{ fontSize: 13, fontWeight: 500, display: "block" }}
          >
            Source text
          </label>
          <textarea
            id="sourceText"
            rows={6}
            style={{
              borderRadius: 18,
              border: "1px solid var(--border-subtle)",
              padding: "0.7rem 0.9rem",
              backgroundColor: "rgba(15,23,42,0.9)",
              color: "var(--text)",
              resize: "vertical",
            }}
            value={text}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder="For example: Where is the nearest metro station?"
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <label
              htmlFor="targetLang"
              style={{ fontSize: 13, fontWeight: 500, display: "block" }}
            >
              Target language
            </label>
            <select
              id="targetLang"
              className="input-field"
              style={{ maxWidth: 140 }}
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
            </select>
          </div>
          <div
            style={{
              borderRadius: 18,
              border: "1px solid var(--border-subtle)",
              padding: "0.7rem 0.9rem",
              minHeight: "6rem",
              fontSize: 13,
              color: translated ? "var(--text)" : "var(--text-soft)",
            }}
          >
            {loading
              ? "Translating..."
              : translated || "Translation will appear here as you type."}
          </div>
        </div>
      </section>
    </div>
  );
}

