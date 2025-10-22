import express from 'express'
import auth from '../Middleware/authMiddleware.js'
import {
  getBillReminders,
  getBillReminder,
  createBillReminder,
  updateBillReminder,
  markBillPaid,
  deleteBillReminder,
  checkBillReminders
} from '../controllers/billReminderController.js'

const router = express.Router()

router.get('/', auth, getBillReminders)
router.get('/check-reminders', checkBillReminders) // For cron job
router.get('/:id', auth, getBillReminder)
router.post('/', auth, createBillReminder)
router.put('/:id', auth, updateBillReminder)
router.patch('/:id/mark-paid', auth, markBillPaid)
router.delete('/:id', auth, deleteBillReminder)

export default router
