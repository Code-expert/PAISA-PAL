import { GoogleGenerativeAI } from '@google/generative-ai';
import Insight from '../models/Insight.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import catchAsync from '../Middleware/catchAsync.js';
import sendPush from '../utils/sendPush.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ ADD: Retry logic with exponential backoff
async function generateWithRetry(model, prompt, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (error) {
      const isRetryable = error.message?.includes('429') || 
                          error.message?.includes('quota') || 
                          error.message?.includes('503') ||
                          error.message?.includes('500');
      
      if (isRetryable && attempt < maxRetries - 1) {
        const delay = 3000 * Math.pow(2, attempt); // 3s, 6s, 12s
        console.log(`API overloaded (${error.message}). Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
        
        // If it's a 503, maybe the flash model is down. We could theoretically switch models,
        // but for now we just retry with exponential backoff.
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

export const chatWithAI = catchAsync(async (req, res) => {
  const { message, context } = req.body;
  
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const prompt = `
    You are a helpful financial assistant for the PaisaPal app.
    User's Financial Context: ${JSON.stringify(context)}
    User Question/Command: "${message}"
    
    INSTRUCTIONS:
    If the user is asking a general question or asking for advice, provide a helpful, conversational response. Keep it concise. Do NOT output JSON.
    
    CRITICAL: If the user is asking to log/add an expense, transaction, or income (e.g. "I spent 500 on an uber", "Got 50000 salary"), you MUST reply with ONLY a JSON object and absolutely no other text, markdown, or greetings.
    Format exactly like this:
    {"action": "CREATE_TRANSACTION", "amount": 500, "category": "Transportation", "description": "Uber", "type": "expense"}
    
    Valid categories: Food & Dining, Shopping, Transportation, Entertainment, Healthcare, Utilities, Income, Other.
  `;
  
  let finalMessage = "";
  let isTransactionCreated = false;

  try {
    const result = await generateWithRetry(model, prompt);
    const response = await result.response;
    const aiReplyRaw = response.text();
    finalMessage = aiReplyRaw;
    
    try {
      const cleanJson = aiReplyRaw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      if (parsed.action === 'CREATE_TRANSACTION') {
        await Transaction.create({
          user: req.user.id,
          amount: parsed.amount,
          type: parsed.type || 'expense',
          category: parsed.category || 'Other',
          description: parsed.description || 'AI Logged Expense',
          date: new Date(),
          source: 'ai_chat'
        });
        finalMessage = `✅ I have automatically logged ₹${parsed.amount} under **${parsed.category}** (${parsed.description}).`;
        isTransactionCreated = true;
      }
    } catch (e) {
      // Not a valid JSON, which means it's a conversational reply. Proceed normally.
    }
  } catch (error) {
    console.error("AI Chat generation failed:", error);
    finalMessage = "I'm sorry, I am currently experiencing high demand and cannot process your request right now. Please try again in a few minutes.";
  }

  const insight = await Insight.create({
    user: req.user.id,
    messages: [{ role: 'user', content: message }],
    aiReply: finalMessage,
  });

  await sendPush(req.user.id, 'New AI Insight', finalMessage.slice(0, 100), '/insights');

  res.json({ 
    success: true, 
    message: finalMessage,
    transactionCreated: isTransactionCreated,
    suggestions: [
      "How much did I spend this month?",
      "Log ₹400 for dinner with friends",
      "Can you suggest a budget for entertainment?"
    ]
  });
});

export const getAIInsights = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const transactions = await Transaction.find({ user: userId }).limit(50);
  const budgets = await Budget.find({ user: userId });
  
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const prompt = `
    Analyze this financial data and provide 3-5 actionable insights:
    
    Recent Transactions: ${JSON.stringify(transactions.slice(0, 10))}
    Current Budgets: ${JSON.stringify(budgets)}
    
    Respond in this exact JSON format:
    {
      "insights": [
        {
          "id": 1,
          "title": "Spending Pattern Alert",
          "description": "Your description here...",
          "type": "spending_pattern",
          "priority": "high",
          "confidence": 0.85,
          "details": ["Detail 1", "Detail 2"],
          "impact": {
            "potential_savings": "200"
          }
        }
      ]
    }
  `;

  try {
    // ✅ CHANGED: Use retry logic
    const result = await generateWithRetry(model, prompt);
    const response = await result.response;
    const responseText = await response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    const aiResponse = JSON.parse(jsonMatch[0]);
    
    res.json(aiResponse);
  } catch (error) {
    console.error('AI Insights Error:', error);
    res.json({
      insights: [
        {
          id: 1,
          title: "Spending Analysis Complete",
          description: "Your financial data has been analyzed. Continue tracking for more insights.",
          type: "spending_pattern",
          priority: "medium",
          confidence: 0.8,
          details: ["Track more transactions for better insights"],
          impact: { potential_savings: "0" }
        }
      ]
    });
  }
});

export const getPersonalizedTips = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const transactions = await Transaction.find({ user: userId }).limit(30);
  const budgets = await Budget.find({ user: userId });
  
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const prompt = `
    Based on this financial data, provide 5 personalized money-saving tips:
    
    Transactions: ${JSON.stringify(transactions)}
    Budgets: ${JSON.stringify(budgets)}
    
    Format as this exact JSON:
    {
      "tips": [
        {
          "title": "Reduce Dining Out Expenses",
          "description": "You spent $300 on restaurants this month. Try meal prep to save $100.",
          "impact": "Save $100/month"
        }
      ]
    }
  `;

  try {
    // ✅ CHANGED: Use retry logic
    const result = await generateWithRetry(model, prompt);
    const response = await result.response;
    const responseText = await response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    const tips = JSON.parse(jsonMatch[0]);
    
    res.json(tips);
  } catch (error) {
    console.error('AI Tips Error:', error);
    res.json({
      tips: [
        {
          title: "Track Your Expenses",
          description: "Keep recording your daily expenses to identify spending patterns.",
          impact: "Better financial awareness"
        },
        {
          title: "Set Monthly Budgets",
          description: "Create budgets for each category to control your spending.",
          impact: "Improved financial control"
        }
      ]
    });
  }
});

export const getPredictions = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const transactions = await Transaction.find({ user: userId }).limit(100);
  
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const prompt = `
    Analyze spending patterns and predict next month's expenses:
    
    Transaction History: ${JSON.stringify(transactions)}
    
    Provide predictions in this exact JSON format:
    {
      "predictions": {
        "spending_forecast": [
          {
            "category": "Food",
            "predicted_amount": 400,
            "confidence": 0.8,
            "trend": "up",
            "period": 30
          }
        ]
      }
    }
  `;

  try {
    // ✅ CHANGED: Use retry logic
    const result = await generateWithRetry(model, prompt);
    const response = await result.response;
    const responseText = await response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    const predictions = JSON.parse(jsonMatch[0]);
    
    res.json(predictions);
  } catch (error) {
    console.error('AI Predictions Error:', error);
    res.json({
      predictions: {
        spending_forecast: [
          {
            category: "General",
            predicted_amount: 500,
            confidence: 0.6,
            trend: "stable",
            period: 30
          }
        ]
      }
    });
  }
});

export const getLatestInsight = catchAsync(async (req, res) => {
  const insight = await Insight.findOne({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, insight });
});

export const generateMonthlyReport = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  // Get start and end of current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const transactions = await Transaction.find({ 
    user: userId,
    date: { $gte: startOfMonth, $lte: endOfMonth }
  });
  
  const budgets = await Budget.find({ user: userId });
  
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const prompt = `
    You are an expert financial advisor. Generate a detailed monthly financial report based on the following data for this month:
    
    Transactions: ${JSON.stringify(transactions)}
    Budgets: ${JSON.stringify(budgets)}
    
    You must respond ONLY with this exact JSON format. Do not use conversational text.
    {
      "executiveSummary": "A concise paragraph summarizing their overall financial health this month.",
      "grade": "A+", // (or A, B, C, D, F) based on how well they stuck to budgets
      "biggestDrain": "Name of the category or specific habit draining the most money, with a brief explanation.",
      "savingsOpportunity": "A highly specific, actionable tip to save money next month.",
      "topCategories": [
        { "name": "Food", "amount": 500, "status": "over_budget" } // status can be over_budget, under_budget, or on_track
      ]
    }
  `;

  try {
    const result = await generateWithRetry(model, prompt);
    const response = await result.response;
    const responseText = await response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    const report = JSON.parse(jsonMatch[0]);
    
    res.json(report);
  } catch (error) {
    console.error('AI Monthly Report Error:', error);
    res.json({
      executiveSummary: "We couldn't generate your personalized AI report due to high server demand. Your raw data is still securely logged.",
      grade: "N/A",
      biggestDrain: "Data unavailable",
      savingsOpportunity: "Please try generating the report again later.",
      topCategories: []
    });
  }
});
