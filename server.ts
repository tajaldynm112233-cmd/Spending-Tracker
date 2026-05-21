import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy check-and-create Gemini AI Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): { ai: GoogleGenAI; modelName: string } {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment secrets.");
  }
  
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return { ai: aiClient, modelName: "gemini-3.5-flash" };
}

// Ensure the local dev server and standard production are serving smoothly
// API endpoint for smart wealth analysis
app.post("/api/analyze", async (req, res) => {
  try {
    const { transactions, budgetLimits, savingsGoals, startingBalance } = req.body;
    
    // Check if Gemini Key is available. If not, generate high-quality fallback analysis 
    // mock to prevent user blocks, while prompting how to add their key.
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing. Providing rule-based fallback analytics.");
      
      // Calculate basic rule-based feedback
      const totalExpenses = (transactions || [])
        .filter((t: any) => t.type === "expense")
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
      const totalIncome = (transactions || [])
        .filter((t: any) => t.type === "income")
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
      
      const balance = startingBalance + totalIncome - totalExpenses;
      const budgetOverCount = (budgetLimits || []).filter((b: any) => {
        const spent = (transactions || [])
          .filter((t: any) => t.type === "expense" && t.category === b.category)
          .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
        return spent > b.limit;
      }).length;

      let score = 80;
      if (totalExpenses > totalIncome && totalIncome > 0) score -= 15;
      if (budgetOverCount > 0) score -= 10 * budgetOverCount;
      score = Math.max(10, Math.min(100, score));

      return res.json({
        wellnessScore: score,
        overviewText: `[DEMO MODE - No API Key Found] Standard budget status. Active starting balance of $${startingBalance}. Monthly spending matches expected seasonal curves. Add a GEMINI_API_KEY in Settings > Secrets to unlock full AI Coach and predictive savings models!`,
        positiveHabits: [
          transactions.length > 0 ? "You are actively entering your transactions regularly." : "Ready to log your first transactions and budgets.",
          totalIncome > totalExpenses ? "Current positive cashflow of is maintaining your balance." : "Entering a high-expense phase; watch your limits."
        ],
        alarms: budgetOverCount > 0 ? [`Warning: You have exceeded ${budgetOverCount} category budget limits!`] : [],
        savingTips: [
          "Set up savings goals to automatically track target values.",
          "Check your category progress bars before spending on premium luxuries."
        ]
      });
    }

    const { ai, modelName } = getGeminiClient();

    const analysisPrompt = `
      You are an expert personal finance analyst. Analyze the user's spending habits, income stream, budget pacing, and saving targets to generate a structured core financial health analysis.
      
      Starting Balance configured: $${startingBalance}
      Current transactions entered:
      ${JSON.stringify(transactions || [], null, 2)}
      
      Configured Budget Limits per Category:
      ${JSON.stringify(budgetLimits || [], null, 2)}
      
      Sought Savings Goals:
      ${JSON.stringify(savingsGoals || [], null, 2)}

      Please return a neat JSON response according to the requested schema. Ensure the insights are highly specific, constructive, actionable, and refer directly to details within the logged transactions.
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: analysisPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["wellnessScore", "overviewText", "positiveHabits", "alarms", "savingTips"],
          properties: {
            wellnessScore: {
              type: Type.INTEGER,
              description: "A financial health score from 0 to 100 based on net savings rate, budget discipline, and balances."
            },
            overviewText: {
              type: Type.STRING,
              description: "A summary overview (3-4 sentences maximum) outlining their current financial velocity, budget compliance, and trajectory."
            },
            positiveHabits: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 2 to 3 good spending behaviors detected from their ledger (e.g., 'Zero transport costs', 'Consistent salary streams')."
            },
            alarms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of urgent warnings or danger areas where the user is reaching or surpassing budgets, or has a negative cash flow."
            },
            savingTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 2 to 3 practical, super actionable saving optimizations custom tailored to high expense categories found in their logs."
            }
          }
        }
      }
    });

    const report = JSON.parse(response.text.trim());
    return res.json(report);

  } catch (error: any) {
    console.error("Analysis API error:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze spending tracker data." });
  }
});

// Conversations endpoint with the smart advisor coach
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, transactions, budgetLimits, savingsGoals, startingBalance } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      const lastUserMsg = messages[messages.length - 1]?.content || "";
      return res.json({
        content: `I'd love to examine your transactions and guide you, but the **GEMINI_API_KEY** environment variable is missing in our development workspace!

To activate me as your fully interactive personal finance coach:
1. Tap the **Settings** icon on top or bottom sidebar.
2. Select **Secrets**.
3. Add a secret named \`GEMINI_API_KEY\` with a valid Gemini key.

In the meantime, let me guide you mathematically: Your starting balance is **$${startingBalance}**. Your net transactions total is **$${
          (transactions || []).reduce((sum: number, t: any) => t.type === 'income' ? sum + Number(t.amount) : sum - Number(t.amount), 0)
        }**! How can I help you adjust your budget planning today?`
      });
    }

    const { ai, modelName } = getGeminiClient();

    // Compile a highly rich prompt summarizing the financial state for absolute awareness
    const stateSummary = `
      User Financial Context Summary:
      - Starting Balance: $${startingBalance}
      - Total Transactions Logged: ${transactions?.length || 0}
      - Budget Limits Set: ${JSON.stringify(budgetLimits || [])}
      - Savings Targets Defined: ${JSON.stringify(savingsGoals || [])}
      - Ledger Records: ${JSON.stringify(transactions || [])}
    `;

    // Construct the standard chat conversation
    const mappedMessages = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    // Inject system guidelines in the conversation start setup
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [{
            text: `You are SpendWise Coach, an elite, friendly, and practical personal finance assistant.
            You have access to the user's detailed transaction history and budgets.
            ${stateSummary}
            Be encouraging, direct, and suggest concrete calculations (e.g. telling them how many dollars to save per month). Keep responses concise, clear, and easy to read using clean bold Markdown highlights.`
          }]
        },
        ...mappedMessages
      ]
    });

    return res.json({ content: response.text });

  } catch (error: any) {
    console.error("Advisor Chat API error:", error);
    return res.status(500).json({ error: error.message || "Failed to carry out coach request." });
  }
});

// Configure Vite static file serving and reverse-proxying properly
async function configureServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Spending Tracker server running securely on http://localhost:${PORT}`);
  });
}

configureServer();
