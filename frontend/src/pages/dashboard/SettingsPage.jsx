import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useProfile } from "../../hooks/useProfile.js";
import { User, Mail, Wallet, Check } from "lucide-react";

// Common currencies for home currency selection
const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
];

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const { profile, fetchProfile, updateProfile, loading } = useProfile();
  const [selectedCurrency, setSelectedCurrency] = useState(user?.preferredCurrency || "USD");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile?.preferredCurrency) {
      setSelectedCurrency(profile.preferredCurrency);
    }
  }, [profile]);

  const handleCurrencyChange = async (e) => {
    const newCurrency = e.target.value;
    setSelectedCurrency(newCurrency);
    setSaving(true);
    setSaved(false);
    
    const result = await updateProfile({ preferredCurrency: newCurrency });
    setSaving(false);
    
    if (result.success) {
      setSaved(true);
      // Update the auth context user
      if (setUser) {
        setUser(prev => ({ ...prev, preferredCurrency: newCurrency }));
        // Update session storage
        const stored = window.sessionStorage.getItem("beyondly-auth");
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.user.preferredCurrency = newCurrency;
          window.sessionStorage.setItem("beyondly-auth", JSON.stringify(parsed));
        }
      }
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
          <p className="text-sm text-gray-500">Your personal information</p>
        </div>
        
        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">
                {(user?.name || user?.email)?.[0]?.toUpperCase()}
              </span>
            </div>
            
            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="w-4 h-4 text-gray-400" />
                    Name
                  </label>
                  <div className="px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-900">
                    {user?.name || "Not set"}
                  </div>
                </div>
                
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400" />
                    Email
                  </label>
                  <div className="px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-900">
                    {user?.email || "Not set"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Currency Settings Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Currency Preferences</h2>
          <p className="text-sm text-gray-500">Set your home currency for budget calculations</p>
        </div>
        
        <div className="p-6">
          <div className="max-w-md">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Wallet className="w-4 h-4 text-gray-400" />
                Home Currency
              </label>
              <div className="flex items-center gap-3">
                <select
                  value={selectedCurrency}
                  onChange={handleCurrencyChange}
                  disabled={saving}
                  className="flex-1 h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
                {saving && (
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
                {saved && (
                  <div className="flex items-center gap-1 text-emerald-600">
                    <Check className="w-5 h-5" />
                    <span className="text-sm">Saved</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                All your trip budgets will be converted to this currency for total calculations in the dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

