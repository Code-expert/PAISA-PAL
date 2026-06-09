import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = 'mongodb+srv://harshraj9804:eInEV2qQxp31cJF8@cluster0.yiiivai.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function fixBudgetDates() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const db = mongoose.connection.db;
    const budgets = db.collection('budgets');
    const transactions = db.collection('transactions');

    const allBudgets = await budgets.find({}).toArray();
    let updated = 0;

    for (const budget of allBudgets) {
      const currentStart = new Date(budget.startDate);
      
      let newStart, newEnd;
      const now = new Date(); // use current date so budgets roll over to this month for testing

      if (budget.period === 'monthly') {
        newStart = new Date(now.getFullYear(), now.getMonth(), 1);
        newEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (budget.period === 'weekly') {
        newStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        newStart.setDate(newStart.getDate() - newStart.getDay());
        newEnd = new Date(newStart);
        newEnd.setDate(newStart.getDate() + 7);
      } else if (budget.period === 'yearly') {
        newStart = new Date(now.getFullYear(), 0, 1);
        newEnd = new Date(now.getFullYear(), 11, 31);
      } else {
        newStart = new Date(now.getFullYear(), now.getMonth(), 1);
        newEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }
      
      newEnd.setHours(23, 59, 59, 999);

      await budgets.updateOne(
        { _id: budget._id },
        { 
          $set: { 
            startDate: newStart,
            endDate: newEnd
          } 
        }
      );
      
      // Recalculate Actual for the new date range!
      const actual = await transactions.aggregate([
        { 
          $match: { 
            user: budget.user,
            category: budget.category,
            type: 'expense',
            date: { $gte: newStart, $lte: newEnd }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray();
      
      const actualAmount = actual[0] ? actual[0].total : 0;
      await budgets.updateOne(
        { _id: budget._id },
        { $set: { actual: actualAmount, spent: actualAmount } }
      );
      
      updated++;
    }

    console.log(`Updated dates and recalculated actuals for ${updated} budgets.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

fixBudgetDates();
