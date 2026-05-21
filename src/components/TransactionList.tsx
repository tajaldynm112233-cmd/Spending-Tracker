import React, { useState, useMemo } from "react";
import { Transaction, Category, TransactionType } from "../types";
import { Search, SlidersHorizontal, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, Calendar, PiggyBank, ReceiptText } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export default function TransactionList({ transactions, onDelete }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | TransactionType>("all");
  const [filterCategory, setFilterCategory] = useState<"all" | Category>("all");
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter & Sort Logic combined
  const processedTransactions = useMemo(() => {
    let result = [...transactions];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          t.notes?.toLowerCase().includes(term) ||
          t.paymentMethod.toLowerCase().includes(term)
      );
    }

    // Type filter
    if (filterType !== "all") {
      result = result.filter((t) => {
        // Safe correction check: salary is always income
        const actualType = (t.category === "Salary & Yield") ? "income" : t.type;
        return actualType === filterType;
      });
    }

    // Category filter
    if (filterCategory !== "all") {
      result = result.filter((t) => t.category === filterCategory);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === "amount") {
        comparison = Number(a.amount) - Number(b.amount);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchTerm, filterType, filterCategory, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(processedTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedTransactions.slice(start, start + itemsPerPage);
  }, [processedTransactions, currentPage]);

  const toggleSort = (field: "date" | "amount") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const getCatBadgeColor = (cat: Category): string => {
    const badges: Record<Category, string> = {
      "Food & Dining": "bg-rose-50 text-rose-600 border-rose-100",
      "Utilities & Bills": "bg-sky-50 text-sky-600 border-sky-100",
      "Entertainment & Leisure": "bg-purple-50 text-purple-600 border-purple-100",
      "Transportation": "bg-amber-50 text-amber-600 border-amber-100",
      "Healthcare & Wellness": "bg-emerald-50 text-emerald-600 border-emerald-100",
      "Education": "bg-indigo-50 text-indigo-600 border-indigo-100",
      "Shopping": "bg-pink-50 text-pink-600 border-pink-100",
      "Housing & Rent": "bg-teal-50 text-teal-600 border-teal-100",
      "Salary & Yield": "bg-green-50 text-green-600 border-green-100",
      "Other": "bg-slate-50 text-slate-600 border-slate-100",
    };
    return badges[cat] || "bg-slate-50 text-slate-600 border-slate-100";
  };

  return (
    <div id="transactions_ledger_panel" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      {/* Search and control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="font-sans font-semibold tracking-tight text-slate-900 text-sm">Account Ledger</h3>
          <p className="font-sans text-xs text-slate-500 mt-0.5">Filter, search, and maintain transaction logs</p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="font-sans text-xs pl-9 pr-4 py-2 w-full md:w-48 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-100 focus:border-slate-300 rounded-xl outline-none transition-all"
            />
          </div>

          {/* Type Filter dropdown */}
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as any);
              setCurrentPage(1);
            }}
            className="font-sans text-xs px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 text-slate-600 rounded-xl outline-none cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>

          {/* Category Filter dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value as any);
              setCurrentPage(1);
            }}
            className="font-sans text-xs px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 text-slate-600 rounded-xl outline-none max-w-[130px] cursor-pointer"
          >
            <option value="all">All Category</option>
            <option value="Food & Dining">Food & Dining</option>
            <option value="Utilities & Bills">Utilities & Bills</option>
            <option value="Entertainment & Leisure">Leisure</option>
            <option value="Transportation">Transportation</option>
            <option value="Healthcare & Wellness">Health</option>
            <option value="Education">Education</option>
            <option value="Shopping">Shopping</option>
            <option value="Housing & Rent">Rent</option>
            <option value="Salary & Yield">Income</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Sorting indicators & labels */}
      <div className="flex items-center justify-between text-4xs uppercase tracking-wider text-slate-400 font-sans py-3 px-2">
        <div className="flex items-center gap-2">
          <span>Sort options:</span>
          <button
            onClick={() => toggleSort("date")}
            className={`flex items-center gap-1 hover:text-slate-700 cursor-pointer ${
              sortField === "date" ? "text-slate-800 font-semibold" : ""
            }`}
          >
            Date {sortField === "date" && (sortOrder === "asc" ? "▲" : "▼")}
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => toggleSort("amount")}
            className={`flex items-center gap-1 hover:text-slate-700 cursor-pointer ${
              sortField === "amount" ? "text-slate-800 font-semibold" : ""
            }`}
          >
            Amount {sortField === "amount" && (sortOrder === "asc" ? "▲" : "▼")}
          </button>
        </div>
        <span className="font-mono">{processedTransactions.length} items found</span>
      </div>

      {/* Actual Transaction List grid rows */}
      {paginatedTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-10">
          <ReceiptText className="h-8 w-8 text-slate-300 mb-2" />
          <p className="font-sans text-xs text-slate-500">No transactions match current filters.</p>
          <p className="font-sans text-4xs text-slate-400 mt-1">Tap 'Add Transaction' to populate entries</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {paginatedTransactions.map((t) => {
            const actualIncome = (t.category === "Salary & Yield" || t.type === "income");
            return (
              <div
                key={t.id}
                className="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50/70 transition-colors rounded-xl group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Category initial / visual block */}
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs shrink-0 font-bold border ${getCatBadgeColor(t.category)}`}>
                    {actualIncome ? <PiggyBank className="h-4.5 w-4.5" /> : t.category.substring(0, 1)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-sans font-medium text-xs text-slate-900 truncate">{t.title}</p>
                      <span className="font-sans font-mono text-3xs text-slate-400 hidden sm:inline shrink-0">
                        {t.paymentMethod}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-0.5">
                      <span className="font-sans text-3xs text-slate-400 flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" /> {t.date}
                      </span>
                      <span className={`text-4xs px-2 py-0.5 rounded-full border ${getCatBadgeColor(t.category)}`}>
                        {t.category}
                      </span>
                      {t.notes && (
                        <span className="font-sans text-3xs text-slate-400 italic max-w-[150px] truncate">
                          "{t.notes}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`font-mono text-xs font-semibold ${actualIncome ? "text-emerald-600" : "text-slate-800"}`}>
                    {actualIncome ? "+" : "-"}${Number(t.amount).toLocaleString()}
                  </span>
                  
                  <button
                    onClick={() => onDelete(t.id)}
                    title="Delete record"
                    className="p-1 px-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-50 pt-5 mt-4">
          <p className="font-sans text-3xs text-slate-400">
            Showing Page <span className="font-medium text-slate-900">{currentPage}</span> of <span className="font-medium text-slate-900">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg cursor-pointer transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5 text-slate-600" />
            </button>
            <button
              onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg cursor-pointer transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
