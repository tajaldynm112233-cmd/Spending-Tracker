import React, { useState, useEffect, useRef } from "react";
import { Transaction, BudgetLimit, SavingsGoal, ChatMessage, FinancialReport } from "../types";
import { Sparkles, MessageSquare, Send, CheckCircle, AlertTriangle, Lightbulb, RefreshCw, Bot } from "lucide-react";

interface AICoachProps {
  transactions: Transaction[];
  budgetLimits: BudgetLimit[];
  savingsGoals: SavingsGoal[];
  startingBalance: number;
}

export default function AICoach({
  transactions,
  budgetLimits,
  savingsGoals,
  startingBalance,
}: AICoachProps) {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Run comprehensive health diagnosis using Gemini
  const runDiagnostics = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions,
          budgetLimits,
          savingsGoals,
          startingBalance,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      } else {
        console.error("Failed to run AI spend analytics diagnostics.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Scroll chat bottom automatically
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Run automatically on first mount if there are transactions
  useEffect(() => {
    runDiagnostics();
    // Warm greeting from advisor
    setMessages([
      {
        id: "greet-1",
        role: "model",
        content: `Greetings! I am **SpeakWise Coach**, your active financial analysis advisor. 

I can calculate exact budget percentages, pinpoint hidden expenditures, and help optimize savings. Tap **Diagnose Financial Health** to reload your wellness indices and overview index reports, or write any query below to start planning!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsChatting(true);

    try {
      // Send message history with ledger metadata context for absolute mathematical precision
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          transactions,
          budgetLimits,
          savingsGoals,
          startingBalance,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const modelMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: "model",
          content: data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, modelMsg]);
      } else {
        const errData = await response.json();
        const errMsg: ChatMessage = {
          id: `ae-${Date.now()}`,
          role: "model",
          content: `Apologies, but I encountered an error answering your plan request: ${errData.error || "Please verify credentials."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div id="ai_advisor_insights_panel" className="grid grid-cols-1 xl:grid-cols-5 gap-7">
      {/* LEFT SECTION: AI Financial Well-being Indicators */}
      <div className="xl:col-span-3 space-y-6">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-2xl p-6 relative overflow-hidden shadow-lg border border-slate-800">
          {/* Faint pattern backgrounds */}
          <div className="absolute right-0 top-0 translate-x-20 -translate-y-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
              <h3 className="font-sans font-semibold tracking-tight text-sm text-slate-100">AI Health Diagnostics</h3>
            </div>
            
            <button
              onClick={runDiagnostics}
              disabled={isAnalyzing}
              className="p-1.5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg flex items-center gap-2 text-3xs font-sans border border-white/10 cursor-pointer disabled:opacity-50 transition-colors shrink-0"
            >
              <RefreshCw className={`h-3 w-3 ${isAnalyzing ? "animate-spin" : ""}`} /> Diagnose
            </button>
          </div>

          {/* Diagnosis Score Gages & Overlays */}
          {isAnalyzing ? (
            <div className="py-12 space-y-4 flex flex-col items-center justify-center text-center">
              <RefreshCw className="h-6 w-6 text-indigo-400 animate-spin" />
              <p className="font-sans text-xs text-slate-300">Evaluating your budget margins, balance ratios, and cash velocities...</p>
            </div>
          ) : report ? (
            <div className="py-3 relative z-10 space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Health percentage Gage */}
                <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="50" fill="transparent" stroke="#1e293b" strokeWidth="10" />
                    <circle
                      cx="64"
                      cy="64"
                      r="50"
                      fill="transparent"
                      stroke="#4f46e5"
                      strokeWidth="10"
                      strokeDasharray={2 * Math.PI * 50}
                      strokeDashoffset={2 * Math.PI * 50 * (1 - report.wellnessScore / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono font-bold text-3xl">{report.wellnessScore}</span>
                    <span className="font-sans text-4xs uppercase tracking-widest text-slate-400">Score</span>
                  </div>
                </div>

                {/* Analytical summary */}
                <div>
                  <h4 className="font-sans font-semibold text-xs text-slate-50">Advisor Evaluation Overview</h4>
                  <p className="font-sans text-xs text-slate-300 leading-relaxed mt-2">{report.overviewText}</p>
                </div>
              </div>

              {/* Dynamic Health stats columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5 text-slate-200">
                {/* Good habits */}
                <div className="space-y-2">
                  <p className="font-sans text-4xs uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" /> Strengths Detected
                  </p>
                  <ul className="space-y-1.5 list-none pl-0">
                    {report.positiveHabits.map((h, i) => (
                      <li key={i} className="font-sans text-3xs text-slate-300 flex items-start gap-1">
                        <span className="text-emerald-500 shrink-0">•</span> <span>{h}</span>
                      </li>
                    ))}
                    {report.positiveHabits.length === 0 && (
                      <li className="font-sans text-3xs text-slate-400 italic">No notable patterns logged.</li>
                    )}
                  </ul>
                </div>

                {/* Alarms / Warnings */}
                <div className="space-y-2">
                  <p className="font-sans text-4xs uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" /> High Alerts
                  </p>
                  <ul className="space-y-1.5 list-none pl-0">
                    {report.alarms.map((a, i) => (
                      <li key={i} className="font-sans text-3xs text-slate-300 flex items-start gap-1">
                        <span className="text-rose-400 shrink-0">•</span> <span>{a}</span>
                      </li>
                    ))}
                    {report.alarms.length === 0 && (
                      <li className="font-sans text-3xs text-slate-400 italic">No budget breaches detected. Quiet.</li>
                    )}
                  </ul>
                </div>

                {/* Savings recommendations */}
                <div className="space-y-2">
                  <p className="font-sans text-4xs uppercase tracking-wider text-indigo-300 font-semibold flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5" /> Saving Actions
                  </p>
                  <ul className="space-y-1.5 list-none pl-0">
                    {report.savingTips.map((t, i) => (
                      <li key={i} className="font-sans text-3xs text-slate-300 flex items-start gap-1">
                        <span className="text-indigo-400 shrink-0">•</span> <span>{t}</span>
                      </li>
                    ))}
                    {report.savingTips.length === 0 && (
                      <li className="font-sans text-3xs text-slate-400 italic">Add cost limits to generate customized tips.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Sparkles className="h-8 w-8 text-indigo-400 mb-2" />
              <p className="font-sans text-xs text-slate-300">Diagnose your financial wellness curves instantly using Gemini AI models.</p>
              <button
                onClick={runDiagnostics}
                className="mt-4 font-sans text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4.5 py-2 rounded-xl transition-all cursor-pointer"
              >
                Perform AI Assessment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: Intelligent Conversational Sandbox (Coach chat) */}
      <div id="ai_advisor_chat_panel" className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[400px]">
        {/* Chat header */}
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-800 border border-slate-200">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-sans font-semibold text-slate-950 text-xs">SpendWise AI Coach</h4>
              <p className="font-sans text-4xs text-emerald-600 font-medium tracking-tight">Active Financial Assistant</p>
            </div>
          </div>
          <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
        </div>

        {/* Messaging Box */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col max-w-[85%] ${m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
            >
              {/* Bubble */}
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-xs font-sans leading-relaxed shadow-3xs whitespace-pre-line ${
                  m.role === "user"
                    ? "bg-slate-900 text-white rounded-tr-none"
                    : "bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none"
                }`}
              >
                {m.content}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 font-mono">{m.timestamp}</span>
            </div>
          ))}

          {isChatting && (
            <div className="flex items-center gap-2 text-slate-400 mr-auto max-w-[85%] bg-slate-50 border border-slate-100 rounded-2xl px-3.5 py-2.5">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-225" />
              </span>
              <span className="font-sans text-3xs">Advisor is calculating...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-50 bg-slate-50/50 rounded-b-2xl">
          <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-100 focus-within:border-slate-300 p-1">
            <input
              type="text"
              placeholder="Ask for custom saving strategies..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={isChatting}
              className="flex-1 font-sans text-xs px-2.5 py-2 outline-none border-none bg-transparent"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isChatting}
              className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0"
              title="Query Advisor"
            >
              <Send className="h-3 w-3" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
