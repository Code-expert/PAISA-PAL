import mongoose from 'mongoose'

const billReminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Bill name is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['housing', 'utilities', 'insurance', 'subscriptions', 'loans', 'other']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  frequency: {
    type: String,
    enum: ['once', 'weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  reminderDays: {
    type: Number,
    default: 3, // Remind 3 days before due date
    min: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  },
  lastPaidDate: {
    type: Date
  }
}, {
  timestamps: true
})

// Index for efficient querying of upcoming bills
billReminderSchema.index({ user: 1, dueDate: 1 })
billReminderSchema.index({ user: 1, isPaid: 1, dueDate: 1 })

export default mongoose.model('BillReminder', billReminderSchema)
