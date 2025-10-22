import BillReminder from '../models/BillReminder.js'
import catchAsync from '../middleware/catchAsync.js'
import sendPush from '../utils/sendPush.js'

// Get all bill reminders
export const getBillReminders = catchAsync(async (req, res) => {
  const { status, upcoming } = req.query
  
  const filter = { user: req.user.id }
  
  if (status === 'paid') {
    filter.isPaid = true
  } else if (status === 'unpaid') {
    filter.isPaid = false
  }
  
  // Get upcoming bills (next 30 days)
  if (upcoming === 'true') {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    filter.dueDate = { $gte: now, $lte: thirtyDaysFromNow }
    filter.isPaid = false
  }
  
  const bills = await BillReminder.find(filter).sort({ dueDate: 1 })
  
  res.json({
    success: true,
    bills
  })
})

// Get single bill reminder
export const getBillReminder = catchAsync(async (req, res) => {
  const bill = await BillReminder.findOne({
    _id: req.params.id,
    user: req.user.id
  })
  
  if (!bill) {
    return res.status(404).json({
      success: false,
      message: 'Bill reminder not found'
    })
  }
  
  res.json({ success: true, bill })
})

// Create bill reminder
export const createBillReminder = catchAsync(async (req, res) => {
  const { name, amount, category, dueDate, frequency, reminderDays, notes } = req.body
  
  if (!name || !amount || !category || !dueDate) {
    return res.status(400).json({
      success: false,
      message: 'Name, amount, category, and due date are required'
    })
  }
  
  const bill = await BillReminder.create({
    user: req.user.id,
    name,
    amount: parseFloat(amount),
    category,
    dueDate: new Date(dueDate),
    frequency,
    reminderDays: reminderDays || 3,
    notes
  })
  
  res.status(201).json({
    success: true,
    bill
  })
})

// Update bill reminder
export const updateBillReminder = catchAsync(async (req, res) => {
  const bill = await BillReminder.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true, runValidators: true }
  )
  
  if (!bill) {
    return res.status(404).json({
      success: false,
      message: 'Bill reminder not found'
    })
  }
  
  res.json({ success: true, bill })
})

// Mark bill as paid
export const markBillPaid = catchAsync(async (req, res) => {
  const bill = await BillReminder.findOne({
    _id: req.params.id,
    user: req.user.id
  })
  
  if (!bill) {
    return res.status(404).json({
      success: false,
      message: 'Bill reminder not found'
    })
  }
  
  bill.isPaid = true
  bill.lastPaidDate = new Date()
  
  // If recurring, create next bill
  if (bill.frequency !== 'once') {
    const nextDueDate = calculateNextDueDate(bill.dueDate, bill.frequency)
    
    await BillReminder.create({
      user: bill.user,
      name: bill.name,
      amount: bill.amount,
      category: bill.category,
      dueDate: nextDueDate,
      frequency: bill.frequency,
      reminderDays: bill.reminderDays,
      notes: bill.notes,
      isPaid: false
    })
  }
  
  await bill.save()
  
  res.json({
    success: true,
    bill,
    message: 'Bill marked as paid'
  })
})

// Delete bill reminder
export const deleteBillReminder = catchAsync(async (req, res) => {
  const bill = await BillReminder.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id
  })
  
  if (!bill) {
    return res.status(404).json({
      success: false,
      message: 'Bill reminder not found'
    })
  }
  
  res.json({
    success: true,
    message: 'Bill reminder deleted successfully'
  })
})

// Helper function to calculate next due date
function calculateNextDueDate(currentDate, frequency) {
  const date = new Date(currentDate)
  
  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
    case 'quarterly':
      date.setMonth(date.getMonth() + 3)
      break
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1)
      break
    default:
      break
  }
  
  return date
}

// Check for upcoming bills and send reminders (to be called by cron job)
export const checkBillReminders = catchAsync(async (req, res) => {
  const now = new Date()
  
  // Find all unpaid bills
  const bills = await BillReminder.find({ isPaid: false }).populate('user')
  
  let remindersToSend = 0
  
  for (const bill of bills) {
    const daysUntilDue = Math.ceil((bill.dueDate - now) / (1000 * 60 * 60 * 24))
    
    // Send reminder if within reminder window
    if (daysUntilDue <= bill.reminderDays && daysUntilDue >= 0) {
      await sendPush(
        bill.user._id,
        'Bill Reminder',
        `${bill.name} is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}. Amount: $${bill.amount}`,
        '/bills'
      )
      remindersToSend++
    }
    
    // Send overdue notification
    if (daysUntilDue < 0) {
      await sendPush(
        bill.user._id,
        'Overdue Bill',
        `${bill.name} is overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}!`,
        '/bills'
      )
      remindersToSend++
    }
  }
  
  res.json({
    success: true,
    message: `Sent ${remindersToSend} bill reminders`
  })
})
