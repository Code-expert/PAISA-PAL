import mongoose from 'mongoose'

// Your current Receipt.js is mostly good, just add:
const receiptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  fileUrl: { type: String, required: true },
  filePath: { type: String, required: true },
  
  // ✅ ADD THESE OCR FIELDS:
  fileType: { type: String }, // image/jpeg, application/pdf
  fileSize: { type: Number }, // file size in bytes
  
  // OCR Results
  amount: { type: Number },
  merchant: { type: String },
  extractedText: { type: String },
  category: { type: String, default: 'Other' },
  
  // Processing Status
  ocrProcessed: { type: Boolean, default: false },
  processed: { type: Boolean, default: false }, // Add this
  ocrError: { type: String }, // Add this
  
  // Relationships
  linkedTransaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  
  uploadDate: { type: Date, default: Date.now }
}, { timestamps: true })


export default mongoose.model('Receipt', receiptSchema)
