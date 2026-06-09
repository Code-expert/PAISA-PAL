import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Transaction from './models/Transaction.js';

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB.");
  
  const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(5);
  console.log("Latest Transactions:");
  transactions.forEach(t => {
    console.log(`- ${t.date.toISOString().split('T')[0]} | ${t.category} | ${t.amount} | ${t.description} | Source: ${t.source}`);
  });
  
  process.exit(0);
}
check();
