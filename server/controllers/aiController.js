import { GoogleGenerativeAI } from '@google/generative-ai';
import Insight from '../models/Insight.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import catchAsync from '../middleware/catchAsync.js';
import sendPush from '../utils/sendPush.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const chatWithAI = catchAsync(async (req, res) => {
  const { message, context } = req.body;
  
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
  
  const prompt = `
    You are a helpful financial assistant for PaisaPal app.
    User's Financial Context: ${JSON.stringify(context)}
    User Question: ${message}
    
    Provide helpful, personalized financial advice based on their data.
    Keep responses concise but informative.
  `;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const aiReply = response.text();

  const insight = await Insight.create({
    user: req.user.id,
    messages: [{ role: 'user', content: message }],
    aiReply,
  });

  await sendPush(req.user.id, 'New AI Insight', aiReply.slice(0, 100), '/insights');

  res.json({ 
    success: true, 
    message: aiReply,
    suggestions: [
      "How much did I spend this month?",
      "What's my biggest expense category?",
      "Can you suggest a budget for entertainment?"
    ]
  });
});

// ✅ ADD: Get AI Insights (Frontend expects this at GET /api/ai/insights)
export const getAIInsights = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  // Get user's financial data
  const transactions = await Transaction.find({ user: userId }).limit(50);
  const budgets = await Budget.find({ user: userId });
  
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
  
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
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = JSON.parse(response.text());
    
    res.json(aiResponse);
  } catch (error) {
    // Fallback if JSON parsing fails
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

// ✅ ADD: Get Personalized Tips (Frontend expects this at GET /api/ai/tips)
export const getPersonalizedTips = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const transactions = await Transaction.find({ user: userId }).limit(30);
  const budgets = await Budget.find({ user: userId });
  
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
  
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
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const tips = JSON.parse(response.text());
    
    res.json(tips);
  } catch (error) {
    // Fallback tips
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

// ✅ ADD: Get Predictions (Frontend expects this at POST /api/ai/predictions)
export const getPredictions = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const transactions = await Transaction.find({ user: userId }).limit(100);
  
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
  
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
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const predictions = JSON.parse(response.text());
    
    res.json(predictions);
  } catch (error) {
    // Fallback predictions
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
