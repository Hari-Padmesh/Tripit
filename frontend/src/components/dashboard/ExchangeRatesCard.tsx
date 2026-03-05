import { useState } from "react";
import { ArrowRightLeft, RefreshCw, TrendingUp, Calculator } from "lucide-react";
import React from "react";

interface ExchangeRatesCardProps {
  baseCurrency?: string;
  targetCurrency?: string;
  rate?: number;
  loading?: boolean;
  error?: string;
  onFetchRate?: (base: string, target: string) => void;
}

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

export function ExchangeRatesCard({
  baseCurrency = "USD",
  targetCurrency = "EUR",
  rate,
  loading,
  error,
  onFetchRate,
}: ExchangeRatesCardProps) {
  const [base, setBase] = useState(baseCurrency);
  const [target, setTarget] = useState(targetCurrency);
  const [amount, setAmount] = useState(100);

  const convertedAmount = rate ? (amount * rate).toFixed(2) : "—";

  const handleSwap = () => {
    setBase(target);
    setTarget(base);
    if (onFetchRate) onFetchRate(target, base);
  };

  const handleRefresh = () => {
    if (onFetchRate) onFetchRate(base, target);
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-sm font-medium text-gray-500">Exchange Rates</span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
      
      {/* Currency selectors */}
      <div className="flex items-center gap-2 mb-4">
        <select
          value={base}
          onChange={(e) => {
            setBase(e.target.value);
            if (onFetchRate) onFetchRate(e.target.value, target);
          }}
          className="flex-1 min-w-0 bg-gray-100 border border-gray-300 rounded-xl px-2 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-purple-500 cursor-pointer truncate"
        >
          {currencies.map((c) => (
            <option key={c.code} value={c.code} className="bg-white text-gray-900">
              {c.code}
            </option>
          ))}
        </select>
        <button
          onClick={handleSwap}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
        >
          <ArrowRightLeft className="w-4 h-4 text-gray-600" />
        </button>
        <select
          value={target}
          onChange={(e) => {
            setTarget(e.target.value);
            if (onFetchRate) onFetchRate(base, e.target.value);
          }}
          className="flex-1 min-w-0 bg-gray-100 border border-gray-300 rounded-xl px-2 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-purple-500 cursor-pointer truncate"
        >
          {currencies.map((c) => (
            <option key={c.code} value={c.code} className="bg-white text-gray-900">
              {c.code}
            </option>
          ))}
        </select>
      </div>

      {/* Rate display */}
      {rate && (
        <div className="text-center mb-4 py-3 bg-gray-100 rounded-xl">
          <p className="text-xs text-gray-500 mb-1">1 {base} =</p>
          <p className="text-2xl font-bold text-gray-900">{rate.toFixed(4)} <span className="text-purple-600">{target}</span></p>
        </div>
      )}

      {/* Converter */}
      <div className="bg-gray-100 rounded-xl p-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-500">Quick Convert</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-20 bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-purple-500"
              placeholder="Amount"
            />
            <span className="text-xs text-gray-500">{base}</span>
          </div>
          <span className="text-gray-400">=</span>
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-sm font-semibold text-purple-600 break-all">{convertedAmount}</span>
            <span className="text-xs text-gray-500 flex-shrink-0">{target}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
