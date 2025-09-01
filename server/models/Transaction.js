import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['income', 'expense', 'transfer'], required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String },
  receipt: { type: mongoose.Schema.Types.ObjectId, ref: 'Receipt' },
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema); 