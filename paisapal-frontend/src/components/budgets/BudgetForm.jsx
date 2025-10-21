import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Target, DollarSign, Calendar, Tag, Repeat, Save, X } from 'lucide-react'
import { useCreateBudgetMutation, useUpdateBudgetMutation } from '../../services/budgetApi'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Card from '../ui/Card'

const BUDGET_PERIODS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
]

const BUDGET_CATEGORIES = [
  { value: 'food', label: '🍽️ Food & Dining' },
  { value: 'transportation', label: '🚗 Transportation' },
  { value: 'shopping', label: '🛍️ Shopping' },
  { value: 'entertainment', label: '🎬 Entertainment' },
  { value: 'healthcare', label: '🏥 Healthcare' },
  { value: 'utilities', label: '💡 Utilities' },
  { value: 'education', label: '📚 Education' },
  { value: 'housing', label: '🏠 Housing' },
  { value: 'savings', label: '💰 Savings' },
  { value: 'other', label: '📦 Other' }
]

export default function BudgetForm({ onSuccess, onCancel, initialData = null }) {
  const [createBudget, { isLoading: isCreating }] = useCreateBudgetMutation()
  const [updateBudget, { isLoading: isUpdating }] = useUpdateBudgetMutation()
  
  const isLoading = isCreating || isUpdating
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      category: initialData?.category || '',
      amount: initialData?.amount || '',
      period: initialData?.period || 'monthly',
      name: initialData?.name || '',
      description: initialData?.description || '',
      alertThreshold: initialData?.alertThreshold || 80
    }
  })

  const onSubmit = async (data) => {
  try {
    // Calculate start and end dates based on period
    const startDate = new Date()
    let endDate = new Date()
    
    // Set end date based on period
    switch (data.period) {
      case 'weekly':
        endDate.setDate(startDate.getDate() + 7)
        break
      case 'monthly':
        endDate.setMonth(startDate.getMonth() + 1)
        break
      case 'quarterly':
        endDate.setMonth(startDate.getMonth() + 3)
        break
      case 'yearly':
        endDate.setFullYear(startDate.getFullYear() + 1)
        break
      default:
        endDate.setMonth(startDate.getMonth() + 1) // Default to monthly
    }

    const budgetData = {
      name: data.name?.trim(),
      category: data.category,
      amount: parseFloat(data.amount),
      period: data.period,
      alertThreshold: parseInt(data.alertThreshold),
      description: data.description?.trim() || '',
      startDate: startDate.toISOString(), // ✅ Add required field
      endDate: endDate.toISOString()      // ✅ Add required field
    }

    // Your existing validation code...
    
    if (isEditing) {
      await updateBudget({ id: initialData._id, ...budgetData }).unwrap()
      toast.success('Budget updated successfully!')
    } else {
      await createBudget(budgetData).unwrap()
      toast.success('Budget created successfully!')
    }
    
    reset()
    if (onSuccess) onSuccess()
  } catch (error) {
    console.error('Budget operation failed:', error)
    
    // Better error handling
    if (error.data?.message) {
      toast.error(error.data.message)
    } else {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} budget`)
    }
  }
}


  return (
    <Card className="max-w-2xl mx-auto">
      <Card.Header>
        <Card.Title className="flex items-center">
          <Target className="w-5 h-5 mr-2 text-primary-600" />
          {isEditing ? 'Edit Budget' : 'Create New Budget'}
        </Card.Title>
      </Card.Header>

      <Card.Content>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Budget Name */}
          <Input
            label="Budget Name"
            placeholder="e.g., Monthly Groceries, Weekly Entertainment"
            leftIcon={<Tag className="w-4 h-4" />}
            error={errors.name?.message}
            {...register('name', { required: 'Budget name is required' })}
          />

          {/* Category and Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<Controller
  name="period"
  control={control}
  rules={{ required: 'Period is required' }}
  render={({ field }) => (
    <Select
      label="Period"
      options={BUDGET_PERIODS}
      placeholder="Select period"
      error={errors.period?.message}
      {...field}
    />
  )}
/>

            <Controller
              name="period"
              control={control}
              rules={{ required: 'Period is required' }}
              render={({ field }) => (
                <Select
                  label="Period"
                  options={BUDGET_PERIODS}
                  placeholder="Select period"
                  leftIcon={<Repeat className="w-4 h-4" />}
                  error={errors.period?.message}
                  {...field}
                />
              )}
            />
          </div>

          {/* Budget Amount and Alert Threshold */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Budget Amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              leftIcon={<DollarSign className="w-4 h-4" />}
              error={errors.amount?.message}
              {...register('amount', {
                required: 'Budget amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' }
              })}
            />

            <Input
              label="Alert Threshold (%)"
              type="number"
              min="1"
              max="100"
              placeholder="80"
              helperText="Get notified when spending reaches this percentage"
              error={errors.alertThreshold?.message}
              {...register('alertThreshold', {
                required: 'Alert threshold is required',
                min: { value: 1, message: 'Threshold must be at least 1%' },
                max: { value: 100, message: 'Threshold cannot exceed 100%' }
              })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add notes about this budget..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              {...register('description')}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              loading={isLoading}
              leftIcon={<Save className="w-4 h-4" />}
              className="flex-1"
            >
              {isLoading 
                ? (isEditing ? 'Updating...' : 'Creating...') 
                : (isEditing ? 'Update Budget' : 'Create Budget')
              }
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="secondary"
                leftIcon={<X className="w-4 h-4" />}
                onClick={onCancel}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card.Content>
    </Card>
  )
}
