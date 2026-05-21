import React, { useState } from "react";
import { SavingsGoal } from "../types";
import { Plus, Target, Check, Calendar, ArrowUpRight, Trash } from "lucide-react";

interface SavingsGoalsSectionProps {
  savingsGoals: SavingsGoal[];
  onAddGoal: (name: string, target: number, deadline: string) => void;
  onContributeGoal: (id: string, amount: number) => void;
  onDeleteGoal: (id: string) => void;
  availableBalance: number;
}

export default function SavingsGoalsSection({
  savingsGoals,
  onAddGoal,
  onContributeGoal,
  onDeleteGoal,
  availableBalance,
}: SavingsGoalsSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");

  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalName.trim() && parseFloat(goalTarget) > 0 && goalDeadline) {
      onAddGoal(goalName.trim(), parseFloat(goalTarget), goalDeadline);
      setGoalName("");
      setGoalTarget("");
      setGoalDeadline("");
      setShowAddForm(false);
    }
  };

  const handleContributionSubmit = (id: string) => {
    const amt = parseFloat(contributionAmount);
    if (!isNaN(amt) && amt > 0) {
      if (amt > availableBalance) {
        alert(`Insufficient funds! Your available ledger balance is $${availableBalance.toLocaleString()}`);
        return;
      }
      onContributeGoal(id, amt);
      setContributeGoalId(null);
      setContributionAmount("");
    }
  };

  return (
    <div id="savings_targets_section" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-50 mb-6">
        <div>
          <h3 className="font-sans font-semibold tracking-tight text-slate-900 text-sm">Savings Milestones</h3>
          <p className="font-sans text-xs text-slate-500 mt-0.5">Define, fund, and conquer financial milestones</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="font-sans font-medium text-xs px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" /> Set Goal
        </button>
      </div>

      {/* Goal Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-slate-50/50 rounded-xl p-4.5 mb-6 border border-slate-100 space-y-4">
          <p className="font-sans font-semibold text-xs text-slate-800">Establish Savings Target</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-sans text-4xs uppercase tracking-wider text-slate-500 font-semibold">Goal Name</label>
              <input
                type="text"
                placeholder="e.g., Vacation Fund, Mac Pro"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                className="w-full font-sans text-xs p-2 bg-white border border-slate-200 outline-none rounded-lg"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-sans text-4xs uppercase tracking-wider text-slate-500 font-semibold">Target Value ($)</label>
              <input
                type="number"
                placeholder="2500"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                className="w-full font-sans text-xs p-2 bg-white border border-slate-200 outline-none rounded-lg"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-sans text-4xs uppercase tracking-wider text-slate-500 font-semibold">Target Date</label>
              <input
                type="date"
                value={goalDeadline}
                onChange={(e) => setGoalDeadline(e.target.value)}
                className="w-full font-sans text-xs p-2 bg-white border border-slate-200 outline-none rounded-lg"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="font-sans text-xs text-slate-500 px-3.5 py-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="font-sans font-medium text-xs text-white bg-slate-900 px-3.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-800"
            >
              Add Goal
            </button>
          </div>
        </form>
      )}

      {/* Savings Grid Row */}
      {savingsGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-8">
          <Target className="h-7 w-7 text-slate-300 mb-2" />
          <p className="font-sans text-xs text-slate-500">No active savings milestones configured.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {savingsGoals.map((g) => {
            const pct = g.target > 0 ? Math.min(100, (g.current / g.target) * 100) : 0;
            const remaining = Math.max(0, g.target - g.current);
            const isCompleted = g.current >= g.target;

            return (
              <div
                key={g.id}
                className="border border-slate-100 rounded-xl p-4.5 flex flex-col justify-between hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-sans font-semibold text-xs text-slate-800 truncate">{g.name}</span>
                    <button
                      onClick={() => onDeleteGoal(g.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded"
                      title="Discard goal"
                    >
                      <Trash className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Pricing and Target Status */}
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="font-sans font-bold text-base text-slate-900">${g.current.toLocaleString()}</span>
                    <span className="font-sans text-4xs text-slate-400">saved of ${g.target.toLocaleString()}</span>
                  </div>

                  {/* Progress bar info */}
                  <div className="mt-4 space-y-1.5">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${isCompleted ? "bg-emerald-500" : "bg-indigo-600"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-4xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" /> Due {g.deadline}
                      </span>
                      <span>{Math.round(pct)}% Complete</span>
                    </div>
                  </div>
                </div>

                {/* Transfer/Contribution Section */}
                <div className="mt-5 pt-3.5 border-t border-slate-50 shrink-0">
                  {isCompleted ? (
                    <div className="flex items-center gap-1 text-4xs text-emerald-600 font-semibold uppercase bg-emerald-50 py-1.5 px-3 rounded-lg justify-center">
                      <Check className="h-3.5 w-3.5" /> Completed Milestone
                    </div>
                  ) : contributeGoalId === g.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="Amount"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        className="w-full font-mono text-3xs p-1.5 bg-slate-50 border border-slate-200 outline-none rounded-lg"
                        autoFocus
                      />
                      <button
                        onClick={() => handleContributionSubmit(g.id)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg cursor-pointer"
                        title="Confirm save transfer"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setContributeGoalId(g.id)}
                      className="w-full font-sans font-medium text-4xs text-indigo-600 hover:text-white border border-indigo-100 hover:border-indigo-600 hover:bg-indigo-600 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <ArrowUpRight className="h-3 w-3" /> Fund Goal (${remaining.toLocaleString()} left)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
