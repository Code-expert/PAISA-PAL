import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Calendar, Hash, TrendingUp, Briefcase } from 'lucide-react'
import { useCreateInvestmentMutation, useUpdateInvestmentMutation } from '../../services/investmentApi'

const INVESTMENT_TYPES = [
  { value: 'stock', label: '📈 Stock' },
  { value: 'bond', label: '📜 Bond' },
  { value: 'etf', label: '📊 ETF' },
  { value: 'mutual_fund', label: '💼 Mutual Fund' },
  { value: 'crypto', label: '₿ Cryptocurrency' },
  { value: 'real_estate', label: '🏠 Real Estate' }
]

export default function InvestmentForm({ onSuccess, onCancel, initialData = null }) {
  const [createInvestment, { isLoading: isCreating }] = useCreateInvestmentMutation()
  const [updateInvestment, { isLoading: isUpdating }] = useUpdateInvestmentMutation()
  
  const isLoading = isCreating || isUpdating
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      symbol: initialData?.symbol || '',
      name: initialData?.name || '',
      type: initialData?.type || 'stock',
      quantity: initialData?.quantity || '',
      purchasePrice: initialData?.purchasePrice || '',
      currentPrice: initialData?.currentPrice || '',
      purchaseDate: initialData?.purchaseDate 
        ? new Date(initialData.purchaseDate).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0]
    }
  })

  const onSubmit = async (data) => {
    try {
      const investmentData = {
        ...data,
        quantity: parseFloat(data.quantity),
        purchasePrice: parseFloat(data.purchasePrice),
        currentPrice: parseFloat(data.currentPrice),
        purchaseDate: new Date(data.purchaseDate).toISOString()
      }

      if (isEditing) {
        await updateInvestment({ id: initialData._id, ...investmentData }).unwrap()
        toast.success('Investment updated successfully!', { icon: '✏️' })
      } else {
        await createInvestment(investmentData).unwrap()
        toast.success('Investment added successfully!', { icon: '💰' })
      }
      
      reset()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Investment operation error:', error)
      toast.error(error.data?.message || `Failed to ${isEditing ? 'update' : 'add'} investment`)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-emerald-600" />
          {isEditing ? 'Edit Investment' : 'Add New Investment'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track your investment portfolio performance
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Symbol and Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Symbol / Ticker
            </label>
            <input
              type="text"
              placeholder="AAPL, MSFT, BTC, etc."
              className={`w-full px-4 py-3 border ${
                errors.symbol ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all uppercase`}
              {...register('symbol', { required: 'Symbol is required' })}
            />
            {errors.symbol && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.symbol.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Investment Name
            </label>
            <input
              type="text"
              placeholder="Apple Inc., Bitcoin, etc."
              className={`w-full px-4 py-3 border ${
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all`}
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
        </div>

        {/* Type and Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Investment Type
            </label>
            <select
              className={`w-full px-4 py-3 border ${
                errors.type ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all`}
              {...register('type', { required: 'Type is required' })}
            >
              {INVESTMENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {errors.type && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.type.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Purchase Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                className={`w-full pl-10 pr-4 py-3 border ${
                  errors.purchaseDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all`}
                {...register('purchaseDate', { required: 'Purchase date is required' })}
              />
            </div>
            {errors.purchaseDate && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.purchaseDate.message}</p>
            )}
          </div>
        </div>

        {/* Quantity and Prices */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Quantity
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.00001"
                min="0"
                placeholder="0"
                className={`w-full pl-10 pr-4 py-3 border ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all`}
                {...register('quantity', {
                  required: 'Quantity is required',
                  min: { value: 0.00001, message: 'Quantity must be greater than 0' }
                })}
              />
            </div>
            {errors.quantity && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Purchase Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-semibold">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full pl-10 pr-4 py-3 border ${
                  errors.purchasePrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all`}
                {...register('purchasePrice', {
                  required: 'Purchase price is required',
                  min: { value: 0.01, message: 'Price must be greater than 0' }
                })}
              />
            </div>
            {errors.purchasePrice && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.purchasePrice.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Current Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-semibold">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full pl-10 pr-4 py-3 border ${
                  errors.currentPrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all`}
                {...register('currentPrice', {
                  required: 'Current price is required',
                  min: { value: 0.01, message: 'Price must be greater than 0' }
                })}
              />
            </div>
            {errors.currentPrice && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.currentPrice.message}</p>
            )}
          </div>
        </div>

        {/* Helper Text */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>All prices should be in INR. Update current price regularly for accurate portfolio tracking.</span>
          </p>
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
                {isEditing ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              <>
                <Briefcase className="w-5 h-5 mr-2" />
                {isEditing ? 'Update Investment' : 'Add Investment'}
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
