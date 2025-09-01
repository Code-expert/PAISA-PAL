import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import catchAsync from '../middleware/catchAsync.js';

export const getCategoryAnalytics = catchAsync(async (req, res) => {
  const data = await Transaction.aggregate([
    { $match: { user: req.user.id } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } }
  ]);
  res.json({ success: true, data });
});

export const getMonthlyAnalytics = catchAsync(async (req, res) => {
  const data = await Transaction.aggregate([
    { $match: { user: req.user.id } },
    { $group: {
      _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
      total: { $sum: '$amount' }
    } },
    { $sort: { _id: 1 } }
  ]);
  res.json({ success: true, data });
});

export const getBudgetVsActual = catchAsync(async (req, res) => {
  const budgets = await Budget.find({ user: req.user.id });
  const transactions = await Transaction.aggregate([
    { $match: { user: req.user.id } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } }
  ]);
  const actualMap = Object.fromEntries(transactions.map(t => [t._id, t.total]));
  const data = budgets.map(b => ({
    category: b.category,
    budget: b.amount,
    actual: actualMap[b.category] || 0
  }));
  res.json({ success: true, data });
}); 