import { Receipt, PieChart, History } from "lucide-react";
import React from "react";

interface ExpenseCategory {
  name: string;
  amount: number;
  color: string;
}

interface ExpenseCardProps {
  totalBudget?: number;
  totalSpent?: number;
  currency?: string;
  categories?: ExpenseCategory[];
  loading?: boolean;
}

const defaultCategories: ExpenseCategory[] = [
  { name: "Food", amount: 0, color: "bg-orange-400" },
  { name: "Transport", amount: 0, color: "bg-blue-400" },
  { name: "Accommodation", amount: 0, color: "bg-purple-400" },
  { name: "Activities", amount: 0, color: "bg-emerald-400" },
  { name: "Shopping", amount: 0, color: "bg-pink-400" },
];

export function ExpenseCard({ 
  totalBudget = 0, 
  totalSpent = 0, 
  currency = "USD", 
  categories = defaultCategories,
  loading 
}: ExpenseCardProps) {
  const percentUsed = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const remaining = Math.max(totalBudget - totalSpent, 0);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
            <Receipt className="w-4 h-4 text-gray-600" />
          </div>
          <span className="text-sm font-medium text-gray-500">Expense Planner</span>
        </div>
        <PieChart className="w-5 h-5 text-gray-400" />
      </div>

      {loading && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-600 rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading expenses...</span>
        </div>
      )}
      
      {!loading && (
        <>
          {/* Budget overview */}
          <div className="bg-gray-100 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">{totalBudget.toLocaleString()} <span className="text-lg text-gray-500">{currency}</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Remaining</p>
                <p className={`text-lg font-semibold ${remaining < totalBudget * 0.2 ? "text-red-500" : "text-emerald-600"}`}>
                  {remaining.toLocaleString()} {currency}
                </p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                className={`h-2.5 rounded-full transition-all ${
                  percentUsed > 80 ? "bg-red-500" : percentUsed > 50 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">{percentUsed.toFixed(1)}% of budget used</p>
          </div>

          {/* Categories breakdown */}
          <div>
            <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
              <History className="w-3 h-3" />
              Spending by Category
            </p>
            <div className="space-y-3">
              {categories.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                  <span className="text-sm text-gray-700 flex-1">{cat.name}</span>
                  <span className="text-sm font-medium text-gray-900">{cat.amount.toLocaleString()} {currency}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
