import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';

dotenv.config();

const categories = [
  'Salary', 'Business', 'Investment', 'Gift', 'Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other'
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  // Optionally, seed categories in a dedicated collection if you have one
  // Here, just print them as a placeholder
  console.log('Seeding categories:', categories);
  await mongoose.disconnect();
  console.log('Done.');
};

seed(); 