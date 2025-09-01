import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Calendar, DollarSign, Tag, FileText, Save, X } from 'lucide-react'
import { useCreateTransactionMutation } from '../../services/transactionApi'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Card from '../ui/Card'

const TRANSACTION_TYPES = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
  { value: 'transfer', label: 'Transfer' }
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
        `${data.type === 'income' ? 'Income' : data.type === 'expense' ? 'Expense' : 'Transfer'} added successfully!`
      )
      
      reset()
      if (onSuccess) onSuccess(result)
    } catch (error) {
      console.error('Transaction creation failed:', error)
      toast.error(error.data?.message || 'Failed to create transaction')
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <Card.Header>
        <Card.Title className="flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-primary-600" />
          {initialData ? 'Edit Transaction' : 'Add New Transaction'}
        </Card.Title>
      </Card.Header>

      <Card.Content>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Transaction Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TRANSACTION_TYPES.map((type) => (
              <label
                key={type.value}
                className={`
                  relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${selectedType === type.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <input
                  type="radio"
                  value={type.value}
                  {...register('type', { required: 'Transaction type is required' })}
                  className="sr-only"
                />
                <span className={`font-medium ${
                  selectedType === type.value ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {type.label}
                </span>
              </label>
            ))}
          </div>
          {errors.type && (
            <p className="text-red-600 dark:text-red-400 text-sm">{errors.type.message}</p>
          )}

          {/* Amount and Date */}
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
                min: { value: 0.01, message: 'Amount must be greater than 0' },
                pattern: {
                  value: /^\d+\.?\d{0,2}$/,
                  message: 'Please enter a valid amount'
                }
              })}
            />

            <Input
              label="Date"
              type="date"
              leftIcon={<Calendar className="w-4 h-4" />}
              error={errors.date?.message}
              {...register('date', { required: 'Date is required' })}
            />
          </div>

          {/* Category */}
          <Controller
            name="category"
            control={control}
            rules={{ required: 'Category is required' }}
            render={({ field }) => (
              <Select
                label="Category"
                options={CATEGORIES[selectedType] || []}
                placeholder="Select a category"
                error={errors.category?.message}
                {...field}
              />
            )}
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                rows={3}
                placeholder="Add a description for this transaction..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                {...register('description')}
              />
            </div>
          </div>

          {/* Tags */}
          <Input
            label="Tags (Optional)"
            placeholder="work, project, client (comma separated)"
            leftIcon={<Tag className="w-4 h-4" />}
            helperText="Separate multiple tags with commas"
            {...register('tags')}
          />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              loading={isLoading}
              leftIcon={<Save className="w-4 h-4" />}
              className="flex-1"
            >
              {isLoading 
                ? 'Saving...' 
                : initialData 
                  ? 'Update Transaction' 
                  : 'Add Transaction'
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
