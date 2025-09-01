import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imagePath: { type: String, required: true },
  ocrText: { type: String },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
}, { timestamps: true });

export default mongoose.model('Receipt', receiptSchema); 