import React, { useState } from "react";
import { Category, BudgetLimit, Transaction } from "../types";
import { Sliders, Check, Edit2, AlertCircle } from "lucide-react";

interface BudgetCardsProps {
  budgetLimits: BudgetLimit[];
  onChangeLimit: (category: Category, newLimit: number) => void;
  transactions: Transaction[];
}

export default function BudgetCards({ budgetLimits, onChangeLimit, transactions }: BudgetCardsProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [inputValue, setInputValue] = useState("");

  // Calculate real-time expenditure per category
  const categoryExpenses = (cat: Category): number => {
    return transactions
      .filter((t) => t.type === "expense" && t.category === cat)
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const handleStartEdit = (item: BudgetLimit) => {
    setEditingCategory(item.category);
    setInputValue(item.limit.toString());
  };

  const handleSaveEdit = (cat: Category) => {
    const lim = parseFloat(inputValue);
    if (!isNaN(lim) && lim >= 0) {
      onChangeLimit(cat, lim);
    }
    setEditingCategory(null);
  };

  return (
    <div id="category_spend_caps_section" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-50 mb-6">
        <div>
          <h3 className="font-sans font-semibold tracking-tight text-slate-900 text-sm">Category Budget Slices</h3>
          <p className="font-sans text-xs text-slate-500 mt-0.5 font-normal">Establish and customize cost ceilings for maximum discipline</p>
        </div>
        <Sliders className="h-4 w-4 text-slate-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {budgetLimits.map((item) => {
          const spent = categoryExpenses(item.category);
          const limit = item.limit;
          const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
          const remains = Math.max(0, limit - spent);
          const isOver = spent > limit;
          const isWarning = pct >= 75 && !isOver;

          // Compute color schemes based on threshold status
          let pctColor = "bg-indigo-600";
          let textColor = "text-indigo-600";
          let cardBorder = "border-slate-100";

          if (isOver) {
            pctColor = "bg-rose-500";
            textColor = "text-rose-500 animate-pulse";
            cardBorder = "border-rose-100 bg-rose-50/10";
          } else if (isWarning) {
            pctColor = "bg-amber-500";
            textColor = "text-amber-500";
            cardBorder = "border-amber-100 bg-amber-50/10";
          } else {
            pctColor = "bg-emerald-500";
            textColor = "text-emerald-500";
          }

          return (
            <div
              key={item.category}
              className={`rounded-xl border ${cardBorder} p-4.5 flex flex-col justify-between transition-all hover:shadow-md`}
            >
              <div>
                {/* Header Category and Limit change */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-sans font-medium text-xs text-slate-900 truncate">{item.category}</span>
                  
                  {editingCategory === item.category ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-14 font-mono text-3xs p-1 bg-slate-50 border border-slate-200 outline-none rounded-md"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(item.category)}
                        className="p-1 hover:bg-slate-100 rounded text-emerald-600 cursor-pointer"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(item)}
                      title="Adjust Budget Ceiling"
                      className="p-1 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors rounded-md cursor pointer"
                    >
                      <Edit2 className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>

                {/* Main limit reading */}
                <div className="flex items-baseline gap-1 mt-3.5">
                  <span className="font-sans font-bold text-lg text-slate-800">${spent.toLocaleString()}</span>
                  <span className="font-sans text-4xs text-slate-400">of ${limit.toLocaleString()} budget</span>
                </div>
              </div>

              {/* Progress Level */}
              <div className="mt-5 space-y-2">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${pctColor} rounded-full transition-all duration-300`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-4xs text-slate-400">
                  <span>{Math.round(pct)}% Consumed</span>
                  {isOver ? (
                    <span className="flex items-center gap-1 font-semibold text-rose-500 font-sans">
                      <AlertCircle className="h-2.5 w-2.5" /> Exceeded by ${(spent - limit).toLocaleString()}
                    </span>
                  ) : (
                    <span className="font-mono">${remains.toLocaleString()} Left</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
