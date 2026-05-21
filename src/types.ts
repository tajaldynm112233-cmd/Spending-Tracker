export type TransactionType = "expense" | "income";

export type Category = 
  | "Food & Dining"
  | "Utilities & Bills"
  | "Entertainment & Leisure"
  | "Transportation"
  | "Healthcare & Wellness"
  | "Education"
  | "Shopping"
  | "Housing & Rent"
  | "Salary & Yield"
  | "Other";

export type PaymentMethod = "Cash" | "Credit Card" | "Debit Card" | "Bank Transfer";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: Category;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  notes?: string;
  paymentMethod: PaymentMethod;
}

export interface BudgetLimit {
  category: Category;
  limit: number;
  color: string; // Tailwind color class, e.g., 'emerald', 'sky', 'amber', 'rose'
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string; // YYYY-MM-DD
}

export interface FinancialReport {
  wellnessScore: number; // 0 - 100
  overviewText: string;
  positiveHabits: string[];
  alarms: string[];
  savingTips: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}
