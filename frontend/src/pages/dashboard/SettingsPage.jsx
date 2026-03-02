import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
      <header>
        <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Settings</h2>
        <p style={{ marginTop: 4, fontSize: 13, color: "var(--text-soft)" }}>
          Adjust basic preferences for your Beyondly experience.
        </p>
      </header>

      <section
        style={{
          borderRadius: 20,
          padding: "1rem 1.1rem",
          border: "1px solid rgba(148,163,184,0.35)",
          backgroundColor: "rgba(15,23,42,0.9)",
          display: "flex",
          flexDirection: "column",
          gap: "0.8rem",
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: "var(--text-soft)" }}>Account</div>
          <div style={{ marginTop: 4, fontSize: 13 }}>
            Signed in as{" "}
            <span style={{ fontWeight: 600 }}>{user?.name || user?.email}</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-soft)" }}>Theme</div>
          <button
            type="button"
            className="btn-outline"
            onClick={toggleTheme}
            style={{ marginTop: 6 }}
          >
            Current: {theme === "dark" ? "Dark" : "Light"}
          </button>
        </div>
      </section>
    </div>
  );
}

