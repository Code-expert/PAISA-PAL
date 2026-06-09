import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = 'mongodb+srv://harshraj9804:eInEV2qQxp31cJF8@cluster0.yiiivai.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function checkTransactions() {
  try {
    await mongoose.connect(MONGO_URI);
    
    const db = mongoose.connection.db;
    const transactions = db.collection('transactions');
    const budgets = db.collection('budgets');

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    console.log(`Checking transactions between ${startOfMonth} and ${endOfMonth}`);

    const results = await budgets.find({}).toArray();
    console.log(JSON.stringify(results, null, 2));

    console.log(JSON.stringify(results, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTransactions();
