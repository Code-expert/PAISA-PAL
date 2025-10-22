import mongoose from 'mongoose'

const investmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symbol: {
    type: String,
    required: [true, 'Symbol is required'],
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['stock', 'bond', 'etf', 'mutual_fund', 'crypto', 'real_estate'],
    required: [true, 'Investment type is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  purchasePrice: {
    type: Number,
    required: [true, 'Purchase price is required'],
    min: [0, 'Purchase price cannot be negative']
  },
  currentPrice: {
    type: Number,
    required: [true, 'Current price is required'],
    min: [0, 'Current price cannot be negative']
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for current value (total worth now)
investmentSchema.virtual('currentValue').get(function() {
  return this.currentPrice * this.quantity
})

// Virtual for purchase value (what you paid)
investmentSchema.virtual('purchaseValue').get(function() {
  return this.purchasePrice * this.quantity
})

// Virtual for gain/loss in dollars
investmentSchema.virtual('gainLoss').get(function() {
  return this.currentValue - this.purchaseValue
})

// Virtual for gain/loss percentage
investmentSchema.virtual('gainLossPercentage').get(function() {
  const percentage = ((this.gainLoss / this.purchaseValue) * 100)
  return isFinite(percentage) ? percentage.toFixed(2) : '0.00'
})

export default mongoose.model('Investment', investmentSchema)
