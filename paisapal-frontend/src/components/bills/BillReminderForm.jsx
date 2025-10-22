import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { DollarSign, Calendar, Bell, FileText } from 'lucide-react'
import { useCreateBillReminderMutation, useUpdateBillReminderMutation } from '../../services/billReminderApi'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'

const CATEGORIES = [
  { value: 'housing', label: 'Housing' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'subscriptions', label: 'Subscriptions' },
  { value: 'loans', label: 'Loans' },
  { value: 'other', label: 'Other' }
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
        toast.success('Bill reminder updated successfully!')
      } else {
        await createBill(billData).unwrap()
        toast.success('Bill reminder created successfully!')
      }
      
      reset()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Bill operation failed:', error)
      toast.error(error.data?.message || `Failed to ${isEditing ? 'update' : 'create'} bill reminder`)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Bill Name */}
      <Input
        label="Bill Name"
        placeholder="e.g., Electricity Bill, Rent, Internet"
        error={errors.name?.message}
        {...register('name', { required: 'Bill name is required' })}
      />

      {/* Amount and Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-4 h-4" />}
          error={errors.amount?.message}
          {...register('amount', {
            required: 'Amount is required',
            min: { value: 0.01, message: 'Amount must be greater than 0' }
          })}
        />
        
        <Select
          label="Category"
          options={CATEGORIES}
          error={errors.category?.message}
          {...register('category', { required: 'Category is required' })}
        />
      </div>

      {/* Due Date and Frequency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Due Date"
          type="date"
          leftIcon={<Calendar className="w-4 h-4" />}
          error={errors.dueDate?.message}
          {...register('dueDate', { required: 'Due date is required' })}
        />
        
        <Select
          label="Frequency"
          options={FREQUENCIES}
          error={errors.frequency?.message}
          {...register('frequency', { required: 'Frequency is required' })}
        />
      </div>

      {/* Reminder Days */}
      <Select
        label="Reminder"
        options={REMINDER_DAYS}
        leftIcon={<Bell className="w-4 h-4" />}
        error={errors.reminderDays?.message}
        {...register('reminderDays', { required: 'Reminder setting is required' })}
      />

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes (Optional)
        </label>
        <textarea
          rows={3}
          placeholder="Add any additional notes about this bill..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
          {...register('notes')}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="submit"
          loading={isLoading}
          className="flex-1"
        >
          {isLoading 
            ? (isEditing ? 'Updating...' : 'Creating...') 
            : (isEditing ? 'Update Bill Reminder' : 'Create Bill Reminder')
          }
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
