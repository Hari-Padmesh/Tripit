import { Wallet, TrendingUp, TrendingDown, PiggyBank, Plus } from "lucide-react";
import React from "react";

interface WalletCardProps {
  tripTitle?: string;
  currency?: string;
  budget?: number;
  spent?: number;
  onCreateWallet?: () => void;
  loading?: boolean;
}

export function WalletCard({ tripTitle, currency, budget, spent, onCreateWallet, loading }: WalletCardProps) {
  const remaining = budget && spent !== undefined ? budget - spent : 0;
  const percentUsed = budget ? Math.min((spent || 0) / budget * 100, 100) : 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-sm font-medium text-gray-500">Trip Wallet</span>
        </div>
        <PiggyBank className="w-5 h-5 text-gray-400" />
      </div>

      {loading && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-600 rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading wallet...</span>
        </div>
      )}

      {!loading && !budget && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 mb-4">No active trip wallet</p>
          <button
            onClick={onCreateWallet}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Trip Wallet
          </button>
        </div>
      )}

      {!loading && budget !== undefined && (
        <div>
          {tripTitle && (
            <p className="text-xs text-gray-500 mb-2 truncate">{tripTitle}</p>
          )}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-gray-900">{remaining.toLocaleString()}</span>
            <span className="text-lg text-gray-500">{currency}</span>
            <span className="text-xs text-gray-400">remaining</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className={`h-2 rounded-full transition-all ${
                percentUsed > 80 ? "bg-red-500" : percentUsed > 50 ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-gray-500">
              <TrendingDown className="w-3 h-3 text-red-500" />
              Spent: {(spent || 0).toLocaleString()} {currency}
            </span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              Budget: {budget.toLocaleString()} {currency}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
