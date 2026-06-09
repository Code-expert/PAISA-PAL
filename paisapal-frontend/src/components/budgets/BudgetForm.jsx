import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Target, Tag, Repeat, Save, X, AlertCircle } from 'lucide-react'
import { useCreateBudgetMutation, useUpdateBudgetMutation } from '../../services/budgetApi'

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
      const now = new Date()
      let startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()) // Start of today
      let endDate = new Date(startDate)
      
      switch (data.period) {
        case 'weekly':
          // Start of current week (Sunday)
          startDate.setDate(startDate.getDate() - startDate.getDay())
          endDate = new Date(startDate)
          endDate.setDate(startDate.getDate() + 7)
          break
        case 'monthly':
          // Start of current month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0) // Last day of month
          break
        case 'quarterly':
          const quarter = Math.floor(now.getMonth() / 3)
          startDate = new Date(now.getFullYear(), quarter * 3, 1)
          endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0)
          break
        case 'yearly':
          startDate = new Date(now.getFullYear(), 0, 1)
          endDate = new Date(now.getFullYear(), 11, 31)
          break
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      }
      
      // Ensure end date is end of day
      endDate.setHours(23, 59, 59, 999)

      const budgetData = {
        name: data.name?.trim(),
        category: data.category,
        amount: parseFloat(data.amount),
        period: data.period,
        alertThreshold: parseInt(data.alertThreshold),
        description: data.description?.trim() || '',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
      
      if (isEditing) {
        await updateBudget({ id: initialData._id, ...budgetData }).unwrap()
        toast.success('Budget updated successfully!', { icon: '✏️' })
      } else {
        await createBudget(budgetData).unwrap()
        toast.success('Budget created successfully!', { icon: '🎯' })
      }
      
      reset()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Budget operation failed:', error)
      
      if (error.data?.message) {
        toast.error(error.data.message)
      } else {
        toast.error(`Failed to ${isEditing ? 'update' : 'create'} budget`)
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-surface-container backdrop-blur-md rounded-3xl border border-outline-variant/30 p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-on-surface flex items-center">
          <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl mr-3">
            <Target className="w-6 h-6 text-white" />
          </div>
          {isEditing ? 'Edit Budget' : 'Create New Budget'}
        </h2>
        <p className="text-sm text-on-surface-variant mt-1 ml-14">
          Set spending limits and track your financial goals
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Budget Name */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">
            Budget Name
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="e.g., Monthly Groceries, Weekly Entertainment"
              className={`w-full pl-10 pr-4 py-3 border ${
                errors.name ? 'border-red-500' : 'border-outline-variant/50'
              } rounded-xl shadow-sm focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-700 dark:text-white transition-all duration-200`}
              {...register('name', { required: 'Budget name is required' })}
            />
          </div>
          {errors.name && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Category and Period */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">
              Category
            </label>
            <Controller
              name="category"
              control={control}
              rules={{ required: 'Category is required' }}
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full px-4 py-3 border ${
                    errors.category ? 'border-red-500' : 'border-outline-variant/50'
                  } rounded-xl shadow-sm focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-700 dark:text-white transition-all duration-200`}
                >
                  <option value="">Select category</option>
                  {BUDGET_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.category && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">
              Period
            </label>
            <div className="relative">
              <Repeat className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Controller
                name="period"
                control={control}
                rules={{ required: 'Period is required' }}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`w-full pl-10 pr-4 py-3 border ${
                      errors.period ? 'border-red-500' : 'border-outline-variant/50'
                    } rounded-xl shadow-sm focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-700 dark:text-white transition-all duration-200 appearance-none`}
                  >
                    <option value="">Select period</option>
                    {BUDGET_PERIODS.map((period) => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
            {errors.period && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.period.message}</p>
            )}
          </div>
        </div>

        {/* Budget Amount and Alert Threshold */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">
              Budget Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-semibold">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full pl-10 pr-4 py-3 border ${
                  errors.amount ? 'border-red-500' : 'border-outline-variant/50'
                } rounded-xl shadow-sm focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-700 dark:text-white transition-all duration-200`}
                {...register('amount', {
                  required: 'Budget amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' }
                })}
              />
            </div>
            {errors.amount && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">
              Alert Threshold (%)
            </label>
            <div className="relative">
              <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                min="1"
                max="100"
                placeholder="80"
                className={`w-full pl-10 pr-4 py-3 border ${
                  errors.alertThreshold ? 'border-red-500' : 'border-outline-variant/50'
                } rounded-xl shadow-sm focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-700 dark:text-white transition-all duration-200`}
                {...register('alertThreshold', {
                  required: 'Alert threshold is required',
                  min: { value: 1, message: 'Threshold must be at least 1%' },
                  max: { value: 100, message: 'Threshold cannot exceed 100%' }
                })}
              />
            </div>
            {errors.alertThreshold && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.alertThreshold.message}</p>
            )}
            <p className="text-xs text-on-surface-variant mt-1">
              Get notified when spending reaches this percentage
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">
            Description (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Add notes about this budget..."
            className="w-full px-4 py-3 border border-outline-variant/50 rounded-xl shadow-sm focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-700 dark:text-white transition-all duration-200 resize-none"
            {...register('description')}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-outline-variant/30">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-primary text-on-primary font-semibold rounded-xl hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {!isLoading && <Save className="w-5 h-5 mr-2" />}
            {isLoading 
              ? (isEditing ? 'Updating...' : 'Creating...') 
              : (isEditing ? 'Update Budget' : 'Create Budget')
            }
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="sm:w-auto px-6 py-3 bg-surface-container-highest text-on-surface font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
            >
              <X className="w-5 h-5 mr-2" />
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
