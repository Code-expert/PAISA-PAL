import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import catchAsync from '../middleware/catchAsync.js';
import sendPush from '../utils/sendPush.js';
import mongoose from 'mongoose';  // ✅ Import mongoose

export const getBudgets = catchAsync(async (req, res) => {
  const budgets = await Budget.find({ user: req.user.id }).sort({ startDate: -1 });
  
  const budgetsData = await Promise.all(budgets.map(async (budget) => {
    const actual = await Transaction.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(req.user.id),  // ✅ Convert to ObjectId
          category: budget.category,
          type: 'expense',
          date: { $gte: budget.startDate, $lte: budget.endDate }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const actualAmount = actual[0] ? actual[0].total : 0;
    const remaining = budget.amount - actualAmount;
    const percentage = budget.amount > 0 ? (actualAmount / budget.amount) * 100 : 0;
    
    return {
      ...budget.toObject(),
      actual: actualAmount,
      remaining,
      percentage
    };
  }));
  
  res.json({ success: true, budgets: budgetsData });
});

export const createBudget = catchAsync(async (req, res) => {
  const { amount, category, startDate, endDate } = req.body;
  
  if (!amount || !category || !startDate || !endDate) {
    return res.status(400).json({ 
      success: false, 
      message: 'Amount, category, startDate, and endDate are required' 
    });
  }
  
  if (isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Amount must be a positive number' 
    });
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start >= end) {
    return res.status(400).json({ 
      success: false, 
      message: 'End date must be after start date' 
    });
  }
  
  const budget = await Budget.create({ 
    ...req.body, 
    user: req.user.id,
    amount: parseFloat(amount)
  });
  
  // ✅ Check if over budget
  const actual = await Transaction.aggregate([
    { 
      $match: { 
        user: new mongoose.Types.ObjectId(req.user.id),  // ✅ Convert to ObjectId
        category: budget.category,
        type: 'expense',
        date: { $gte: budget.startDate, $lte: budget.endDate }
      } 
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  if (actual[0] && actual[0].total > budget.amount) {
    await sendPush(
      req.user.id, 
      'Budget Exceeded', 
      `You have exceeded your budget for ${budget.category}.`, 
      '/budgets'
    );
  }
  
  res.status(201).json({ success: true, budget });
});

export const updateBudget = catchAsync(async (req, res) => {
  if (req.body.amount !== undefined) {
    if (isNaN(req.body.amount) || parseFloat(req.body.amount) <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be a positive number' 
      });
    }
    req.body.amount = parseFloat(req.body.amount);
  }
  
  const budget = await Budget.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!budget) {
    return res.status(404).json({ 
      success: false, 
      message: 'Budget not found or unauthorized' 
    });
  }
  
  res.json({ success: true, budget });
});

export const deleteBudget = catchAsync(async (req, res) => {
  const budget = await Budget.findOneAndDelete({ 
    _id: req.params.id, 
    user: req.user.id 
  });
  
  if (!budget) {
    return res.status(404).json({ 
      success: false, 
      message: 'Budget not found or unauthorized' 
    });
  }
  
  res.json({ 
    success: true, 
    message: 'Budget deleted successfully' 
  });
});
