import mongoose from 'mongoose';

const financialSummarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  income: { type: Number, default: 0 },
  expenses: { type: Number, default: 0 },
  savings: { type: Number, default: 0 },
  netWorth: { type: Number, default: 0 },
  // Optionally, add timestamps or a date field for tracking over time
}, { timestamps: true });

export default mongoose.model('FinancialSummary', financialSummarySchema);
