import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import catchAsync from '../middleware/catchAsync.js';

// ✅ Helper function to update budget spending
async function updateBudgetSpending(userId, category, amount, operation = 'add') {
  try {
    const now = new Date();
    
    // Find active budget for this category within current period
    const budget = await Budget.findOne({
      user: userId,
      category: category,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    if (budget) {
      if (operation === 'add') {
        budget.spent += amount;
      } else if (operation === 'subtract') {
        budget.spent = Math.max(0, budget.spent - amount);
      } else if (operation === 'replace') {
        // For updates: recalculate from transactions
        const transactions = await Transaction.aggregate([
          {
            $match: {
              user: userId,
              category: category,
              type: 'expense',
              date: {
                $gte: new Date(budget.startDate),
                $lte: new Date(budget.endDate),
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' },
            },
          },
        ]);
        budget.spent = transactions[0]?.total || 0;
      }

      budget.actual = budget.spent;
      budget.remaining = budget.amount - budget.spent;
      budget.percentage = (budget.spent / budget.amount) * 100;

      await budget.save();
      console.log(`✅ Updated budget ${budget.name}: $${budget.spent}/$${budget.amount}`);
    }
  } catch (error) {
    console.error('Error updating budget:', error);
  }
}

export const getTransactions = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, category, type, startDate, endDate } = req.query;
  
  const filter = { user: req.user.id };
  if (category) filter.category = category;
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  
  const transactions = await Transaction.find(filter)
    .sort({ date: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);
  const total = await Transaction.countDocuments(filter);
  
  res.json({ 
    success: true, 
    transactions, 
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
      itemsPerPage: limitNum
    }
  });
});

export const createTransaction = catchAsync(async (req, res) => {
  const { amount, type, category, date, description } = req.body;
  
  if (!amount || !type || !category || !date) {
    return res.status(400).json({ 
      success: false, 
      message: 'Amount, type, category, and date are required' 
    });
  }
  
  if (isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Amount must be a positive number' 
    });
  }
  
  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Type must be either income or expense' 
    });
  }
  
  const transaction = await Transaction.create({ 
    ...req.body, 
    user: req.user.id,
    amount: parseFloat(amount)
  });
  
  // ✅ Update budget if this is an expense
  if (type === 'expense') {
    await updateBudgetSpending(req.user.id, category, parseFloat(amount), 'add');
  }
  
  res.status(201).json({ success: true, transaction });
});

export const updateTransaction = catchAsync(async (req, res) => {
  // Get old transaction first
  const oldTransaction = await Transaction.findOne({ 
    _id: req.params.id, 
    user: req.user.id 
  });
  
  if (!oldTransaction) {
    return res.status(404).json({ 
      success: false, 
      message: 'Transaction not found or unauthorized' 
    });
  }
  
  if (req.body.amount !== undefined) {
    if (isNaN(req.body.amount) || parseFloat(req.body.amount) <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be a positive number' 
      });
    }
    req.body.amount = parseFloat(req.body.amount);
  }
  
  if (req.body.type && !['income', 'expense'].includes(req.body.type)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Type must be either income or expense' 
    });
  }
  
  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );
  
  // ✅ Update budgets if expense changed
  const oldWasExpense = oldTransaction.type === 'expense';
  const newIsExpense = transaction.type === 'expense';
  
  if (oldWasExpense) {
    // Recalculate old category budget
    await updateBudgetSpending(req.user.id, oldTransaction.category, 0, 'replace');
  }
  
  if (newIsExpense) {
    // Recalculate new category budget
    await updateBudgetSpending(req.user.id, transaction.category, 0, 'replace');
  }
  
  res.json({ success: true, transaction });
});

export const deleteTransaction = catchAsync(async (req, res) => {
  const transaction = await Transaction.findOne({ 
    _id: req.params.id, 
    user: req.user.id 
  });
  
  if (!transaction) {
    return res.status(404).json({ 
      success: false, 
      message: 'Transaction not found or unauthorized' 
    });
  }
  
  // ✅ Update budget if this was an expense
  if (transaction.type === 'expense') {
    await updateBudgetSpending(req.user.id, transaction.category, transaction.amount, 'subtract');
  }
  
  await transaction.deleteOne();
  
  res.json({ 
    success: true, 
    message: 'Transaction deleted successfully' 
  });
});
