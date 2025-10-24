import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Calendar, Tag, FileText, Save, X, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react'
import { useCreateTransactionMutation } from '../../services/transactionApi'

const TRANSACTION_TYPES = [
  { value: 'expense', label: 'Expense', icon: TrendingDown, color: 'from-red-500 to-pink-600' },
  { value: 'income', label: 'Income', icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
  { value: 'transfer', label: 'Transfer', icon: ArrowRightLeft, color: 'from-blue-500 to-indigo-600' }
]

const CATEGORIES = {
  expense: [
    { value: 'food', label: '🍽️ Food & Dining' },
    { value: 'transportation', label: '🚗 Transportation' },
    { value: 'shopping', label: '🛍️ Shopping' },
    { value: 'entertainment', label: '🎬 Entertainment' },
    { value: 'healthcare', label: '🏥 Healthcare' },
    { value: 'utilities', label: '💡 Utilities' },
    { value: 'education', label: '📚 Education' },
    { value: 'other', label: '📦 Other' }
  ],
  income: [
    { value: 'salary', label: '💼 Salary' },
    { value: 'freelance', label: '💻 Freelance' },
    { value: 'business', label: '🏢 Business' },
    { value: 'investment', label: '📈 Investment Returns' },
    { value: 'rental', label: '🏠 Rental Income' },
    { value: 'other', label: '💰 Other Income' }
  ],
  transfer: [
    { value: 'savings', label: '🏦 To Savings' },
    { value: 'checking', label: '💳 To Checking' },
    { value: 'investment', label: '📊 To Investment' },
    { value: 'other', label: '↔️ Other Transfer' }
  ]
}

export default function TransactionForm({ onSuccess, onCancel, initialData = null }) {
  const [createTransaction, { isLoading }] = useCreateTransactionMutation()
  const [selectedType, setSelectedType] = useState(initialData?.type || 'expense')

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      type: initialData?.type || 'expense',
      amount: initialData?.amount || '',
      category: initialData?.category || '',
      description: initialData?.description || '',
      date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      tags: initialData?.tags?.join(', ') || ''
    }
  })

  const watchType = watch('type')

  React.useEffect(() => {
    setSelectedType(watchType)
  }, [watchType])

  const onSubmit = async (data) => {
    try {
      const transactionData = {
        ...data,
        amount: parseFloat(data.amount),
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        date: new Date(data.date).toISOString()
      }

      const result = await createTransaction(transactionData).unwrap()
      
      toast.success(
        `${data.type === 'income' ? 'Income' : data.type === 'expense' ? 'Expense' : 'Transfer'} added successfully!`,
        {
          icon: data.type === 'income' ? '💰' : data.type === 'expense' ? '💸' : '↔️'
        }
      )
      
      reset()
      if (onSuccess) onSuccess(result)
    } catch (error) {
      console.error('Transaction creation failed:', error)
      toast.error(error.data?.message || 'Failed to create transaction')
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mr-3">
            <span className="text-white text-2xl font-bold">₹</span>
          </div>
          {initialData ? 'Edit Transaction' : 'Add New Transaction'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-14">
          Track your income, expenses, and transfers
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Transaction Type - Enhanced Cards */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Transaction Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TRANSACTION_TYPES.map((type) => {
              const Icon = type.icon
              const isSelected = selectedType === type.value
              return (
                <label
                  key={type.value}
                  className={`
                    relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                    ${isSelected
                      ? 'border-transparent shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                    }
                  `}
                >
                  {isSelected && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-10 rounded-xl`} />
                  )}
                  <input
                    type="radio"
                    value={type.value}
                    {...register('type', { required: 'Transaction type is required' })}
                    className="sr-only"
                  />
                  <div className={`relative p-3 rounded-xl mb-2 bg-gradient-to-br ${type.color} ${!isSelected && 'opacity-60'}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`font-semibold text-sm ${
                    isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {type.label}
                  </span>
                </label>
              )
            })}
          </div>
          {errors.type && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-2">{errors.type.message}</p>
          )}
        </div>

        {/* Amount and Date */}
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
                } rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all duration-200`}
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
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                className={`w-full pl-10 pr-4 py-3 border ${
                  errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all duration-200`}
                {...register('date', { required: 'Date is required' })}
              />
            </div>
            {errors.date && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <Controller
            name="category"
            control={control}
            rules={{ required: 'Category is required' }}
            render={({ field }) => (
              <div>
                <select
                  {...field}
                  className={`w-full px-4 py-3 border ${
                    errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all duration-200`}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES[selectedType]?.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          />
          {errors.category && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.category.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              rows={3}
              placeholder="Add a description for this transaction..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all duration-200 resize-none"
              {...register('description')}
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Tags (Optional)
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="work, project, client (comma separated)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
              {...register('tags')}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Separate multiple tags with commas
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {!isLoading && <Save className="w-5 h-5 mr-2" />}
            {isLoading 
              ? 'Saving...' 
              : initialData 
                ? 'Update Transaction' 
                : 'Add Transaction'
            }
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="sm:w-auto px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
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
