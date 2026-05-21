import React, { useState, useEffect } from "react";
import { Transaction, Category, BudgetLimit, SavingsGoal, PaymentMethod } from "./types";
import SpendChart from "./components/SpendChart";
import TransactionList from "./components/TransactionList";
import BudgetCards from "./components/BudgetCards";
import SavingsGoalsSection from "./components/SavingsGoalsSection";
import AICoach from "./components/AICoach";
import { 
  DollarSign, 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Bot, 
  LayoutDashboard, 
  Receipt,
  PiggyBank,
  Check,
  Edit3,
  X,
  CreditCard,
  Settings
} from "lucide-react";

// Realistic Seed data to populate pristine, loaded charts from the outset
const INITIAL_STARTING_BALANCE = 5000;

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: "t-1",
    title: "Monthly Salary Deposit",
    amount: 4800,
    category: "Salary & Yield",
    date: "2026-05-01",
    type: "income",
    notes: "Main employment bank wire",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "t-2",
    title: "Monthly Apartment Rent Payment",
    amount: 1400,
    category: "Housing & Rent",
    date: "2026-05-01",
    type: "expense",
    notes: "Auto debit transfer",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "t-3",
    title: "Prime Cut Steakhouse Dinner",
    amount: 145,
    category: "Food & Dining",
    date: "2026-05-08",
    type: "expense",
    notes: "Birthday celebration dinner with team",
    paymentMethod: "Credit Card",
  },
  {
    id: "t-4",
    title: "Wired Broadband & Utilities Bill",
    amount: 110,
    category: "Utilities & Bills",
    date: "2026-05-10",
    type: "expense",
    notes: "Internet and trash auto charge",
    paymentMethod: "Debit Card",
  },
  {
    id: "t-5",
    title: "Eco Green Groceries Stock",
    amount: 165,
    category: "Food & Dining",
    date: "2026-05-14",
    type: "expense",
    notes: "Organic stock for two weeks",
    paymentMethod: "Debit Card",
  },
  {
    id: "t-6",
    title: "Local Cab Transit Charge",
    amount: 32,
    category: "Transportation",
    date: "2026-05-16",
    type: "expense",
    notes: "Late night commuter taxi",
    paymentMethod: "Cash",
  },
  {
    id: "t-7",
    title: "Tech Desktop Accessory Upgrade",
    amount: 220,
    category: "Shopping",
    date: "2026-05-19",
    type: "expense",
    notes: "Ergonomic leather footrest and keycaps",
    paymentMethod: "Credit Card",
  },
];

const DEFAULT_BUDGET_LIMITS: BudgetLimit[] = [
  { category: "Food & Dining", limit: 600, color: "rose" },
  { category: "Utilities & Bills", limit: 300, color: "sky" },
  { category: "Entertainment & Leisure", limit: 400, color: "purple" },
  { category: "Transportation", limit: 200, color: "amber" },
  { category: "Healthcare & Wellness", limit: 150, color: "emerald" },
  { category: "Education", limit: 250, color: "indigo" },
  { category: "Shopping", limit: 500, color: "pink" },
  { category: "Housing & Rent", limit: 1600, color: "teal" },
];

const SEED_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: "g-1",
    name: "Emergency Reserve Fund",
    target: 10000,
    current: 4200,
    deadline: "2026-12-31",
  },
  {
    id: "g-2",
    name: "Vite Summer Retreat",
    target: 2500,
    current: 850,
    deadline: "2026-08-15",
  },
];

export default function App() {
  // ---------------- STATE SYNC WITH LOCAL STORAGE ----------------
  const [startingBalance, setStartingBalance] = useState<number>(() => {
    const saved = localStorage.getItem("spend_starting_balance");
    return saved ? parseFloat(saved) : INITIAL_STARTING_BALANCE;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("spend_transactions_log");
    return saved ? JSON.parse(saved) : SEED_TRANSACTIONS;
  });

  const [budgetLimits, setBudgetLimits] = useState<BudgetLimit[]>(() => {
    const saved = localStorage.getItem("spend_budget_limits");
    return saved ? JSON.parse(saved) : DEFAULT_BUDGET_LIMITS;
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem("spend_savings_goals");
    return saved ? JSON.parse(saved) : SEED_SAVINGS_GOALS;
  });

  // Navigation Panel Tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "ledger" | "coach">("dashboard");

  // Inline configuration editors
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState(startingBalance.toString());

  // Add Transaction Modal Status
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [txTitle, setTxTitle] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txCategory, setTxCategory] = useState<Category>("Food & Dining");
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [txType, setTxType] = useState<"expense" | "income">("expense");
  const [txPaymentMethod, setTxPaymentMethod] = useState<PaymentMethod>("Credit Card");
  const [txNotes, setTxNotes] = useState("");

  // Persists updates to LocalStorage on modifications
  useEffect(() => {
    localStorage.setItem("spend_starting_balance", startingBalance.toString());
  }, [startingBalance]);

  useEffect(() => {
    localStorage.setItem("spend_transactions_log", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("spend_budget_limits", JSON.stringify(budgetLimits));
  }, [budgetLimits]);

  useEffect(() => {
    localStorage.setItem("spend_savings_goals", JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  // ---------------- MATHEMATICAL FORMULAS & KPIS ----------------
  function mType(t: Transaction): "expense" | "income" {
    if (t.type === "expense" && t.category === "Salary & Yield") {
      return "income";
    }
    return t.type;
  }

  const totalIncome = transactions
    .filter((t) => mType(t) === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => mType(t) === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalSavedGoals = savingsGoals.reduce((sum, g) => sum + Number(g.current), 0);

  // AvailableChecking = Starting + Income - Expenses - Saving Allocations
  const availableBalance = startingBalance + totalIncome - totalExpenses - totalSavedGoals;

  // ---------------- ACTION HANDLERS ----------------
  const handleSaveStartingBalance = () => {
    const val = parseFloat(balanceInput);
    if (!isNaN(val) && val >= 0) {
      setStartingBalance(val);
      setIsEditingBalance(false);
    }
  };

  const handleAddTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(txAmount);
    if (!txTitle.trim() || isNaN(amt) || amt <= 0) return;

    // Check transaction type alignment
    const targetType = txCategory === "Salary & Yield" ? "income" : txType;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      title: txTitle.trim(),
      amount: amt,
      category: txCategory,
      date: txDate,
      type: targetType,
      paymentMethod: txPaymentMethod,
      notes: txNotes.trim() || undefined,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Reset clean fields
    setTxTitle("");
    setTxAmount("");
    setTxDate(new Date().toISOString().split("T")[0]);
    setTxType("expense");
    setTxNotes("");
    setShowAddModal(false);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleChangeCategoryLimit = (cat: Category, limit: number) => {
    setBudgetLimits((prev) =>
      prev.map((itm) => (itm.category === cat ? { ...itm, limit } : itm))
    );
  };

  const handleAddSavingsGoal = (name: string, target: number, deadline: string) => {
    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      name,
      target,
      current: 0,
      deadline,
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const handleContributeSavingsGoal = (id: string, amount: number) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, current: g.current + amount } : g))
    );
  };

  const handleDeleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-16">
      {/* GLOBAL BANNER HEADER */}
      <header className="bg-white border-b border-slate-100 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-slate-950 text-white rounded-md flex items-center justify-center font-bold text-xs">
                S
              </div>
              <h1 className="font-sans font-extrabold text-base tracking-tight text-slate-900">Spending Tracker</h1>
            </div>
            <p className="font-sans text-xs text-slate-500 mt-1">Intelligent personal finance planner and custom budget forecaster</p>
          </div>

          <div className="flex items-center gap-3.5 flex-wrap">
            {/* Nav Switch Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`font-sans font-semibold text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "dashboard" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" /> Planner
              </button>
              <button
                onClick={() => setActiveTab("ledger")}
                className={`font-sans font-semibold text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "ledger" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Receipt className="h-3.5 w-3.5" /> Ledger
              </button>
              <button
                onClick={() => setActiveTab("coach")}
                className={`font-sans font-semibold text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "coach" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Bot className="h-3.5 w-3.5" /> AI Coach
              </button>
            </div>

            {/* Quick Action Add Transaction */}
            <button
              onClick={() => setShowAddModal(true)}
              className="font-sans font-semibold text-xs bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-3xs transition-colors cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" /> Add Record
            </button>
          </div>
        </div>
      </header>

      {/* CORE WRAPPER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* TOP STATUS CARDS (KPI BRICKS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          
          {/* AVAILABLE CAPITAL PORTFOLIO */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-3xs group flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Cash</span>
              <DollarSign className="h-4.5 w-4.5 text-slate-400" />
            </div>
            
            <div className="mt-4">
              <span className="font-sans font-bold text-2xl text-slate-900">${availableBalance.toLocaleString()}</span>
              
              <div className="flex items-center gap-1.5 mt-2">
                {isEditingBalance ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={balanceInput}
                      onChange={(e) => setBalanceInput(e.target.value)}
                      className="w-20 font-mono text-xs px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded outline-none"
                    />
                    <button
                      onClick={handleSaveStartingBalance}
                      className="p-1 hover:bg-slate-100 rounded text-emerald-600 cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsEditingBalance(true);
                      setBalanceInput(startingBalance.toString());
                    }}
                    className="font-sans text-4xs text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                    title="Configure baseline starting capital bank deposits"
                  >
                    <Edit3 className="h-2.5 w-2.5" /> Set Baseline Startup Capital (${startingBalance.toLocaleString()})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* TOTAL SAVINGS ON GOALS */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-3xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-semibold text-slate-400 uppercase tracking-wider">Savings Milestone Cash</span>
              <PiggyBank className="h-4.5 w-4.5 text-slate-400" />
            </div>
            <div className="mt-4">
              <span className="font-sans font-bold text-2xl text-slate-900">${totalSavedGoals.toLocaleString()}</span>
              <p className="font-sans text-4xs text-slate-400 mt-2">Allocated securely to milestone goals</p>
            </div>
          </div>

          {/* RECORDED COSTS */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-3xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-semibold text-slate-400 uppercase tracking-wider">Outflows & Spending</span>
              <TrendingDown className="h-4.5 w-4.5 text-rose-500" />
            </div>
            <div className="mt-4">
              <span className="font-sans font-bold text-2xl text-slate-900">${totalExpenses.toLocaleString()}</span>
              <p className="font-sans text-4xs text-slate-400 mt-2">Expenses cumulative over current month</p>
            </div>
          </div>

          {/* RECORDED EARNINGS */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-3xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-semibold text-slate-400 uppercase tracking-wider">Inflows & Earnings</span>
              <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
            </div>
            <div className="mt-4">
              <span className="font-sans font-bold text-2xl text-slate-900">${totalIncome.toLocaleString()}</span>
              <p className="font-sans text-4xs text-slate-400 mt-2">Salary, interest dividends, and sales logged</p>
            </div>
          </div>
        </div>

        {/* ---------------- TAB SECTIONS ---------------- */}
        
        {/* Tab 1: Dashboard and budget limits and charts */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fade-in">
            {/* Visual Vector Charts */}
            <SpendChart transactions={transactions} startingBalance={startingBalance} />
            
            {/* Category Budget Cards */}
            <BudgetCards
              budgetLimits={budgetLimits}
              onChangeLimit={handleChangeCategoryLimit}
              transactions={transactions}
            />

            {/* Savings goals Milestones */}
            <SavingsGoalsSection
              savingsGoals={savingsGoals}
              onAddGoal={handleAddSavingsGoal}
              onContributeGoal={handleContributeSavingsGoal}
              onDeleteGoal={handleDeleteSavingsGoal}
              availableBalance={availableBalance}
            />
          </div>
        )}

        {/* Tab 2: Full interactive Account Ledger database */}
        {activeTab === "ledger" && (
          <div className="space-y-6 animate-fade-in">
            <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} />
          </div>
        )}

        {/* Tab 3: Interactive Diagnostics and Coach Chat */}
        {activeTab === "coach" && (
          <div className="space-y-6 animate-fade-in">
            <AICoach
              transactions={transactions}
              budgetLimits={budgetLimits}
              savingsGoals={savingsGoals}
              startingBalance={startingBalance}
            />
          </div>
        )}

      </main>

      {/* ---------------- NEW RECORD POPUP MODAL ---------------- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-2xl flex flex-col overflow-hidden animate-zoom-in">
            {/* Modal Head */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-700" />
                <h3 className="font-sans font-semibold text-xs text-slate-900">Add Live Ledger Record</h3>
              </div>
              
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 px-2 hover:bg-slate-200 text-slate-400 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body / Entry Form */}
            <form onSubmit={handleAddTransactionSubmit} className="p-6 space-y-4">
              {/* Type Switch expense vs income */}
              <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setTxType("expense");
                    if (txCategory === "Salary & Yield") {
                      setTxCategory("Food & Dining");
                    }
                  }}
                  className={`font-sans py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    txType === "expense" && txCategory !== "Salary & Yield"
                      ? "bg-white text-rose-600 shadow-3xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Expense Outflow
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxType("income");
                    setTxCategory("Salary & Yield");
                  }}
                  className={`font-sans py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    txType === "income" || txCategory === "Salary & Yield"
                      ? "bg-white text-emerald-600 shadow-3xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Income Inflow
                </button>
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="font-sans text-4xs uppercase tracking-wider text-slate-500 font-semibold">Reference Title</label>
                <input
                  type="text"
                  placeholder="e.g., Target grocer stock, Cable bill"
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="w-full font-sans text-xs p-2.5 bg-slate-50 border border-slate-100 hover:bg-slate-50 focus:bg-white outline-none rounded-xl"
                  required
                />
              </div>

              {/* Amount and Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-sans text-4xs uppercase tracking-wider text-slate-500 font-semibold">Amount Value ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="120.00"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full font-sans text-xs p-2.5 bg-slate-50 border border-slate-100 hover:bg-slate-50 focus:bg-white outline-none rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-4xs uppercase tracking-wider text-slate-500 font-semibold">Transaction Date</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full font-sans text-xs p-2.5 bg-slate-50 border border-slate-100 hover:bg-slate-50 focus:bg-white outline-none rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Category selector */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-sans text-4xs uppercase tracking-wider text-slate-500 font-semibold">Cost Category</label>
                  <select
                    value={txCategory}
                    disabled={txType === "income"}
                    onChange={(e) => setTxCategory(e.target.value as Category)}
                    className="w-full font-sans text-xs p-2.5 bg-slate-50 border border-slate-100 focus:bg-white outline-none rounded-xl cursor-pointer"
                  >
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Utilities & Bills">Utilities & Bills</option>
                    <option value="Entertainment & Leisure">Entertainment & Leisure</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Healthcare & Wellness">Healthcare & Wellness</option>
                    <option value="Education">Education</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Housing & Rent">Housing & Rent</option>
                    <option value="Salary & Yield">Salary & Yield (Inflow)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Payment Channel method */}
                <div className="space-y-1">
                  <label className="font-sans text-4xs uppercase tracking-wider text-slate-500 font-semibold">Payment Method</label>
                  <select
                    value={txPaymentMethod}
                    onChange={(e) => setTxPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full font-sans text-xs p-2.5 bg-slate-50 border border-slate-100 focus:bg-white outline-none rounded-xl cursor-pointer"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              {/* Auxiliary notes */}
              <div className="space-y-1">
                <label className="font-sans text-4xs uppercase tracking-wider text-slate-500 font-semibold">Optional Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Shared with roommates, tax deductible"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  className="w-full font-sans text-xs p-2.5 bg-slate-50 border border-slate-100 hover:bg-slate-50 focus:bg-white outline-none rounded-xl"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="font-sans text-xs text-slate-500 px-4 py-2 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="font-sans font-semibold text-xs text-white bg-slate-900 hover:bg-slate-800 px-5.5 py-2 rounded-xl cursor-pointer transition-colors shadow-3xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
