import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Calendar, Bell, FileText } from 'lucide-react'
import { useCreateBillReminderMutation, useUpdateBillReminderMutation } from '../../services/billReminderApi'

const CATEGORIES = [
  { value: 'housing', label: '🏠 Housing' },
  { value: 'utilities', label: '💡 Utilities' },
  { value: 'insurance', label: '🛡️ Insurance' },
  { value: 'subscriptions', label: '📱 Subscriptions' },
  { value: 'loans', label: '💳 Loans' },
  { value: 'other', label: '📦 Other' }
]

const FREQUENCIES = [
  { value: 'once', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
]

const REMINDER_DAYS = [
  { value: '1', label: '1 day before' },
  { value: '3', label: '3 days before' },
  { value: '5', label: '5 days before' },
  { value: '7', label: '1 week before' },
  { value: '14', label: '2 weeks before' }
]

export default function BillReminderForm({ onSuccess, onCancel, initialData = null }) {
  const [createBill, { isLoading: isCreating }] = useCreateBillReminderMutation()
  const [updateBill, { isLoading: isUpdating }] = useUpdateBillReminderMutation()
  
  const isLoading = isCreating || isUpdating
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      amount: initialData?.amount || '',
      category: initialData?.category || 'utilities',
      dueDate: initialData?.dueDate 
        ? new Date(initialData.dueDate).toISOString().split('T')[0]
        : '',
      frequency: initialData?.frequency || 'monthly',
      reminderDays: initialData?.reminderDays || 3,
      notes: initialData?.notes || ''
    }
  })

  const onSubmit = async (data) => {
    try {
      const billData = {
        ...data,
        amount: parseFloat(data.amount),
        reminderDays: parseInt(data.reminderDays),
        dueDate: new Date(data.dueDate).toISOString()
      }

      if (isEditing) {
        await updateBill({ id: initialData._id, ...billData }).unwrap()
        toast.success('Bill reminder updated successfully!', { icon: '✏️' })
      } else {
        await createBill(billData).unwrap()
        toast.success('Bill reminder created successfully!', { icon: '🔔' })
      }
      
      reset()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Bill operation failed:', error)
      toast.error(error.data?.message || `Failed to ${isEditing ? 'update' : 'create'} bill reminder`)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-emerald-600" />
          {isEditing ? 'Edit Bill Reminder' : 'Create Bill Reminder'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Never miss a payment with automatic reminders
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Bill Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Bill Name
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="e.g., Electricity Bill, Rent, Internet"
              className={`w-full pl-10 pr-4 py-3 border ${
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all`}
              {...register('name', { required: 'Bill name is required' })}
            />
          </div>
          {errors.name && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Amount and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-semibold">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full pl-10 pr-4 py-3 border ${
                  errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all`}
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' }
                })}
              />
            </div>
            {errors.amount && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.amount.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              className={`w-full px-4 py-3 border ${
                errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all`}
              {...register('category', { required: 'Category is required' })}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.category.message}</p>
            )}
          </div>
        </div>

        {/* Due Date and Frequency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Due Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                className={`w-full pl-10 pr-4 py-3 border ${
                  errors.dueDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all`}
                {...register('dueDate', { required: 'Due date is required' })}
              />
            </div>
            {errors.dueDate && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.dueDate.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Frequency
            </label>
            <select
              className={`w-full px-4 py-3 border ${
                errors.frequency ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all`}
              {...register('frequency', { required: 'Frequency is required' })}
            >
              {FREQUENCIES.map(freq => (
                <option key={freq.value} value={freq.value}>{freq.label}</option>
              ))}
            </select>
            {errors.frequency && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.frequency.message}</p>
            )}
          </div>
        </div>

        {/* Reminder Days */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Reminder
          </label>
          <div className="relative">
            <Bell className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              className={`w-full pl-10 pr-4 py-3 border ${
                errors.reminderDays ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all appearance-none`}
              {...register('reminderDays', { required: 'Reminder setting is required' })}
            >
              {REMINDER_DAYS.map(day => (
                <option key={day.value} value={day.value}>{day.label}</option>
              ))}
            </select>
          </div>
          {errors.reminderDays && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.reminderDays.message}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            You'll receive a notification before the due date
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Notes (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Add any additional notes about this bill..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all resize-none"
            {...register('notes')}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Bell className="w-5 h-5 mr-2" />
                {isEditing ? 'Update Bill Reminder' : 'Create Bill Reminder'}
              </>
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="sm:w-auto px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
