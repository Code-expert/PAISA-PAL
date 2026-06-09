import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Receipt from './models/Receipt.js';

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB.");
  
  const receipts = await Receipt.find().sort({ createdAt: -1 }).limit(3);
  console.log("Latest Receipts:");
  receipts.forEach(r => {
    console.log(`- Date: ${r.createdAt.toISOString()} | Merchant: ${r.merchant} | Amount: ${r.amount} | Processed: ${r.processed} | OCR Processed: ${r.ocrProcessed}`);
  });
  
  process.exit(0);
}
check();
