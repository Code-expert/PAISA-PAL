import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }, // ✅ Added for budget name
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  period: { type: String, enum: ['monthly', 'weekly', 'quarterly', 'yearly'], default: 'monthly' }, // ✅ Extended enum
  alertThreshold: { type: Number, default: 80, min: 1, max: 100 }, // ✅ Added for alerts
  description: { type: String, default: '' }, // ✅ Added for optional description
  spent: { type: Number, default: 0 }, // ✅ Track spending against budget
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true }, // ✅ Enable/disable budgets
}, { timestamps: true });

// Add index for better query performance
budgetSchema.index({ user: 1, category: 1, period: 1 });

export default mongoose.model('Budget', budgetSchema);
