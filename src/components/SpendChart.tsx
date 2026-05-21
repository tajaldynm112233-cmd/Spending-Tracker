import React, { useState, useMemo } from "react";
import { Transaction, Category } from "../types";

interface SpendChartProps {
  transactions: Transaction[];
  startingBalance: number;
}

export default function SpendChart({ transactions, startingBalance }: SpendChartProps) {
  const [hoverCategory, setHoverCategory] = useState<Category | null>(null);
  const [hoverPoint, setHoverPoint] = useState<{ x: string; y: number; index: number } | null>(null);

  // 1. Calculations for Expense Categories Donut
  const categoryStats = useMemo(() => {
    const expenses = transactions.filter((t) => mType(t) === "expense");
    const totalExpenseSum = expenses.reduce((acc, t) => acc + Number(t.amount), 0);

    const breakdown: Record<Category, number> = {} as any;
    expenses.forEach((t) => {
      breakdown[t.category] = (breakdown[t.category] || 0) + Number(t.amount);
    });

    const list = Object.entries(breakdown)
      .map(([cat, val]) => ({
        category: cat as Category,
        amount: val,
        percentage: totalExpenseSum > 0 ? (val / totalExpenseSum) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return { list, total: totalExpenseSum };
  }, [transactions]);

  // Color mapper for budget segments
  const getCategoryColor = (cat: Category): string => {
    const colors: Record<Category, string> = {
      "Food & Dining": "#f43f5e", // Rose
      "Utilities & Bills": "#0ea5e9", // Sky
      "Entertainment & Leisure": "#a855f7", // Purple
      "Transportation": "#f59e0b", // Amber
      "Healthcare & Wellness": "#10b981", // Emerald
      "Education": "#6366f1", // Indigo
      "Shopping": "#ec4899", // Pink
      "Housing & Rent": "#14b8a6", // Teal
      "Salary & Yield": "#22c55e", // Green
      "Other": "#64748b", // Slate
    };
    return colors[cat] || "#94a3b8";
  };

  function mType(t: Transaction): "expense" | "income" {
    if (t.type === "expense" && t.category === "Salary & Yield") {
      return "income"; // standard safety normalizer
    }
    return t.type;
  }

  // 2. Calculations for Balance Trend over last 10 log entries or chronological days
  const trendData = useMemo(() => {
    if (transactions.length === 0) return [];
    
    // Sort transactions by date ascending
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let currentBalance = startingBalance;
    const history = sorted.map((t) => {
      if (mType(t) === "income") {
        currentBalance += Number(t.amount);
      } else {
        currentBalance -= Number(t.amount);
      }
      return {
        date: t.date,
        balance: currentBalance,
        title: t.title,
        amount: t.amount,
        type: mType(t)
      };
    });

    // Take the last 15 dates to keep the SVG crisp
    return history.slice(-15);
  }, [transactions, startingBalance]);

  // Dynamic SVG sizing coordinates setup
  const trendSvgCoords = useMemo(() => {
    if (trendData.length === 0) return { path: "", area: "", points: [] };
    const width = 600;
    const height = 180;
    const padding = 20;

    const balances = trendData.map((d) => d.balance);
    const maxBal = Math.max(...balances, startingBalance) * 1.05;
    const minBal = Math.min(...balances, startingBalance) * 0.95;
    const range = maxBal - minBal || 100;

    const interval = (width - padding * 2) / Math.max(1, trendData.length - 1);
    
    const points = trendData.map((d, index) => {
      const x = padding + index * interval;
      // Invert Y coordinate since SVG (0,0) is top-left
      const y = height - padding - ((d.balance - minBal) / range) * (height - padding * 2);
      return { x, y, data: d, index };
    });

    // Create curved Bezier curve or linear SVG path
    let path = "";
    if (points.length > 0) {
      path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        // Smooth line
        const cpX1 = points[i - 1].x + interval / 2;
        const cpY1 = points[i - 1].y;
        const cpX2 = points[i].x - interval / 2;
        const cpY2 = points[i].y;
        path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
      }
    }

    const firstPt = points[0];
    const lastPt = points[points.length - 1];
    let area = "";
    if (points.length > 0) {
      area = `${path} L ${lastPt.x} ${height - padding} L ${firstPt.x} ${height - padding} Z`;
    }

    return { path, area, points };
  }, [trendData, startingBalance]);

  // Calculate Donut Segment Path formulas
  const donutSegments = useMemo(() => {
    let currentAngle = 0;
    const radius = 60;
    const cx = 80;
    const cy = 80;

    return categoryStats.list.map((item) => {
      const angle = (item.percentage / 100) * 360;
      
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle += angle;

      // Convert angles to radians
      const rad1 = ((startAngle - 90) * Math.PI) / 180;
      const rad2 = ((endAngle - 90) * Math.PI) / 180;

      const x1 = cx + radius * Math.cos(rad1);
      const y1 = cy + radius * Math.sin(rad1);
      const x2 = cx + radius * Math.cos(rad2);
      const y2 = cy + radius * Math.sin(rad2);

      const largeArcFlag = angle > 180 ? 1 : 0;
      const d = `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      `;

      return {
        ...item,
        d,
        color: getCategoryColor(item.category),
      };
    });
  }, [categoryStats]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
      {/* 1. Donut Category Chart */}
      <div id="category_donut_card" className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm">
        <div>
          <h3 className="font-sans font-semibold tracking-tight text-slate-900 text-sm">Category Allocation</h3>
          <p className="font-sans text-xs text-slate-500 mt-1">Expense distribution per logged category</p>
        </div>

        {categoryStats.total === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center py-6">
            <span className="text-xl">📊</span>
            <p className="font-sans text-xs text-slate-400 mt-2">No expenses logged for distribution chart.</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
            {/* Donuts SVG */}
            <div className="relative w-40 h-40 shrink-0">
              <svg className="w-full h-full" viewBox="0 0 160 160">
                {/* Empty circle background base */}
                <circle cx="80" cy="80" r="60" fill="none" stroke="#f1f5f9" strokeWidth="14" />
                
                {donutSegments.map((seg, idx) => (
                  <path
                    key={idx}
                    d={seg.d}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={hoverCategory === seg.category ? "18" : "14"}
                    strokeLinecap="round"
                    className="transition-all duration-250 cursor-pointer"
                    onMouseEnter={() => setHoverCategory(seg.category)}
                    onMouseLeave={() => setHoverCategory(null)}
                  />
                ))}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-sans text-2xs uppercase tracking-wider text-slate-400">Total Spent</span>
                <span className="font-sans font-bold text-lg text-slate-800">${categoryStats.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Explanatory Legend */}
            <div className="flex-1 w-full space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {donutSegments.map((seg, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between text-xs p-1.5 rounded-lg transition-colors cursor-pointer ${
                    hoverCategory === seg.category ? "bg-slate-50 font-medium" : ""
                  }`}
                  onMouseEnter={() => setHoverCategory(seg.category)}
                  onMouseLeave={() => setHoverCategory(null)}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="text-slate-600 truncate max-w-[100px]">{seg.category}</span>
                  </div>
                  <span className="text-slate-950 font-mono text-2xs">
                    ${seg.amount.toLocaleString()} ({Math.round(seg.percentage)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Chronological Balance Waves */}
      <div id="balance_waves_card" className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-sans font-semibold tracking-tight text-slate-900 text-sm">Asset & Balance Velocity</h3>
              <p className="font-sans text-xs text-slate-500 mt-1">Timeline of your net balance variations</p>
            </div>
            {trendData.length > 0 && (
              <span className="font-mono text-2xs bg-slate-50 px-2.5 py-1 text-slate-500 rounded-full border border-slate-100">
                {trendData.length} records mapped
              </span>
            )}
          </div>
        </div>

        {trendData.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center py-6">
            <span className="text-xl">📈</span>
            <p className="font-sans text-xs text-slate-400 mt-2">Log transactions to dynamically graph balance velocities.</p>
          </div>
        ) : (
          <div className="relative mt-4">
            <svg className="w-full h-44" viewBox="0 0 600 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Grid lines */}
              <line x1="20" y1="20" x2="580" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="20" y1="90" x2="580" y2="90" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="20" y1="160" x2="580" y2="160" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

              {/* Area gradient */}
              {trendSvgCoords.area && (
                <path d={trendSvgCoords.area} fill="url(#chart-grad)" />
              )}

              {/* Precise curve line */}
              {trendSvgCoords.path && (
                <path d={trendSvgCoords.path} fill="none" stroke="#4f46e5" strokeWidth="2.5" />
              )}

              {/* Point Markers on SVG */}
              {trendSvgCoords.points.map((pt) => (
                <g key={pt.index}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoverPoint?.index === pt.index ? "6" : "3.5"}
                    fill={pt.data.type === "income" ? "#22c55e" : "#4f46e5"}
                    stroke="white"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() =>
                      setHoverPoint({
                        x: pt.x.toString(),
                        y: pt.y,
                        index: pt.index,
                      })
                    }
                    onMouseLeave={() => setHoverPoint(null)}
                  />
                </g>
              ))}
            </svg>

            {/* Smart Inline tooltips */}
            {hoverPoint !== null && (
              <div
                className="absolute bg-slate-950 text-white rounded-lg p-3 text-3xs font-sans shadow-xl border border-slate-800 z-10 pointer-events-none"
                style={{
                  left: `${Math.min(480, Math.max(10, Number(hoverPoint.x) - 60))}px`,
                  top: `${Math.max(10, hoverPoint.y - 70)}px`,
                }}
              >
                <p className="font-semibold text-slate-300">{trendData[hoverPoint.index].date}</p>
                <p className="text-slate-200 mt-1 font-mono font-medium text-2xs">
                  Balance: ${trendData[hoverPoint.index].balance.toLocaleString()}
                </p>
                <p className="text-slate-400 mt-0.5 truncate max-w-[120px]">
                  Ref: {trendData[hoverPoint.index].title} (
                  <span className={trendData[hoverPoint.index].type === "income" ? "text-emerald-400" : "text-rose-400"}>
                    {trendData[hoverPoint.index].type === "income" ? "+" : "-"}${trendData[hoverPoint.index].amount}
                  </span>
                  )
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
