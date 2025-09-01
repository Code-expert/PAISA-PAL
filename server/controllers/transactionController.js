import Transaction from '../models/Transaction.js';
import catchAsync from '../middleware/catchAsync.js';

export const getTransactions = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, category, type, startDate, endDate } = req.query;
  
  // Build filter object
  const filter = { user: req.user.id };
  if (category) filter.category = category;
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  
  // Validate pagination parameters
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
  // Validate required fields
  const { amount, type, category, date, description } = req.body;
  
  if (!amount || !type || !category || !date) {
    return res.status(400).json({ 
      success: false, 
      message: 'Amount, type, category, and date are required' 
    });
  }
  
  // Validate amount is a positive number
  if (isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Amount must be a positive number' 
    });
  }
  
  // Validate type is either 'income' or 'expense'
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
  
  res.status(201).json({ success: true, transaction });
});

export const updateTransaction = catchAsync(async (req, res) => {
  // Validate amount if provided
  if (req.body.amount !== undefined) {
    if (isNaN(req.body.amount) || parseFloat(req.body.amount) <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be a positive number' 
      });
    }
    req.body.amount = parseFloat(req.body.amount);
  }
  
  // Validate type if provided
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
  
  if (!transaction) {
    return res.status(404).json({ 
      success: false, 
      message: 'Transaction not found or unauthorized' 
    });
  }
  
  res.json({ success: true, transaction });
});

export const deleteTransaction = catchAsync(async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({ 
    _id: req.params.id, 
    user: req.user.id 
  });
  
  if (!transaction) {
    return res.status(404).json({ 
      success: false, 
      message: 'Transaction not found or unauthorized' 
    });
  }
  
  res.json({ 
    success: true, 
    message: 'Transaction deleted successfully' 
  });
});