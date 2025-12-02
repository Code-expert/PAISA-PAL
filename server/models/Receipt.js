import mongoose from 'mongoose'

const receiptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  filename: {
    type: String, 
    required: true 
  },
  fileUrl: { 
    type: String, 
    required: true 
  }, // ✅ Cloudinary URL
  cloudinaryId: { 
    type: String 
  }, // ✅ Cloudinary public ID
  fileType: {
    type: String 
  },
  fileSize: { 
    type: Number 
  },
  
  // OCR Results
  amount: { type: Number },
  merchant: { type: String },
  extractedText: { type: String },
  category: { type: String, default: 'Other' },
  
  // Processing Status
  ocrProcessed: { type: Boolean, default: false },
  processed: { type: Boolean, default: false },
  ocrError: { type: String },
  confidence: { type: Number },
  
  // Relationships
  linkedTransaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  uploadDate: { type: Date, default: Date.now }
}, { timestamps: true })

export default mongoose.model('Receipt', receiptSchema)
