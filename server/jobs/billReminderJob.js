import cron from 'node-cron'
import BillReminder from '../models/BillReminder.js'
import sendPush from '../utils/sendPush.js'

// Run every day at 9 AM
export const startBillReminderJob = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('🔔 Running bill reminder check...')
    
    try {
      const now = new Date()
      const bills = await BillReminder.find({ isPaid: false }).populate('user')
      
      let remindersSent = 0
      
      for (const bill of bills) {
        const daysUntilDue = Math.ceil((bill.dueDate - now) / (1000 * 60 * 60 * 24))
        
        // Send reminder if within reminder window
        if (daysUntilDue === bill.reminderDays && daysUntilDue > 0) {
          await sendPush(
            bill.user._id,
            '💰 Bill Reminder',
            `${bill.name} is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}. Amount: $${bill.amount}`,
            '/bills'
          )
          remindersSent++
        }
        
        // Send due today notification
        if (daysUntilDue === 0) {
          await sendPush(
            bill.user._id,
            '⚠️ Bill Due Today',
            `${bill.name} is due today! Amount: $${bill.amount}`,
            '/bills'
          )
          remindersSent++
        }
        
        // Send overdue notification
        if (daysUntilDue < 0) {
          await sendPush(
            bill.user._id,
            '🚨 Overdue Bill',
            `${bill.name} is overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}! Amount: $${bill.amount}`,
            '/bills'
          )
          remindersSent++
        }
      }
      
      console.log(`✅ Sent ${remindersSent} bill reminders`)
    } catch (error) {
      console.error('❌ Bill reminder job failed:', error)
    }
  })
  
  console.log('✅ Bill reminder cron job started (runs daily at 9 AM)')
}
