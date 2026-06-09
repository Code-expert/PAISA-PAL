import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = 'mongodb+srv://harshraj9804:eInEV2qQxp31cJF8@cluster0.yiiivai.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const CATEGORY_MAP = {
  'Food & Dining': 'food',
  'Shopping': 'shopping',
  'Transportation': 'transportation',
  'Entertainment': 'entertainment',
  'Healthcare': 'healthcare',
  'Utilities': 'utilities',
  'Other': 'other'
};

async function fixCategories() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const db = mongoose.connection.db;
    const transactions = db.collection('transactions');
    const receipts = db.collection('receipts');
    const budgets = db.collection('budgets');

    let txUpdated = 0;
    for (const [oldCat, newCat] of Object.entries(CATEGORY_MAP)) {
      const txRes = await transactions.updateMany(
        { category: oldCat },
        { $set: { category: newCat } }
      );
      txUpdated += txRes.modifiedCount;

      const receiptRes = await receipts.updateMany(
        { category: oldCat },
        { $set: { category: newCat } }
      );
      
      const budgetRes = await budgets.updateMany(
        { category: oldCat },
        { $set: { category: newCat } }
      );
    }
    
    // Also fix any budgets that might have actual/spent mismatch, 
    // although budgetController generates this dynamically now, 
    // we should make sure the database `actual` is recalculated if needed.
    // Wait, `budget.actual` is updated in `updateBudgetFromTransaction` in `receiptController.js`.
    // Let's recalculate `actual` for all budgets!
    
    const allBudgets = await budgets.find({}).toArray();
    for (const budget of allBudgets) {
      const actual = await transactions.aggregate([
        { 
          $match: { 
            user: budget.user,
            category: budget.category,
            type: 'expense',
            date: { $gte: budget.startDate, $lte: budget.endDate }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray();
      
      const actualAmount = actual[0] ? actual[0].total : 0;
      await budgets.updateOne(
        { _id: budget._id },
        { $set: { actual: actualAmount } }
      );
    }

    console.log(`Updated ${txUpdated} transactions.`);
    console.log('Fixed categories and recalculated budgets!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

fixCategories();
