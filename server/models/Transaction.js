import mongoose from 'mongoose'


const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  
  // ✅ ADD THESE FOR OCR INTEGRATION:
  receiptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Receipt' },
  source: { type: String, default: 'manual' }, // 'manual', 'receipt_ocr', 'import'
  
}, { timestamps: true })
export default mongoose.model('Transaction', transactionSchema);
