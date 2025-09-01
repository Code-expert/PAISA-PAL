import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { DollarSign, TrendingUp, Calendar, Hash } from 'lucide-react'
import { useCreateInvestmentMutation, useUpdateInvestmentMutation } from '../../services/investmentApi'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Card from '../ui/Card'

const INVESTMENT_TYPES = [
  { value: 'stock', label: 'Stock' },
  { value: 'bond', label: 'Bond' },
  { value: 'etf', label: 'ETF' },
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'real_estate', label: 'Real Estate' }
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
        toast.success('Investment updated successfully!')
      } else {
        await createInvestment(investmentData).unwrap()
        toast.success('Investment added successfully!')
      }
      
      reset()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Investment operation failed:', error)
      toast.error(error.data?.message || `Failed to ${isEditing ? 'update' : 'add'} investment`)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Symbol and Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Symbol"
          placeholder="AAPL, MSFT, BTC, etc."
          error={errors.symbol?.message}
          {...register('symbol', { required: 'Symbol is required' })}
        />
        
        <Input
          label="Name"
          placeholder="Apple Inc., Microsoft Corp., etc."
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
      </div>

      {/* Type and Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Investment Type"
          options={INVESTMENT_TYPES}
          error={errors.type?.message}
          {...register('type', { required: 'Type is required' })}
        />
        
        <Input
          label="Purchase Date"
          type="date"
          leftIcon={<Calendar className="w-4 h-4" />}
          error={errors.purchaseDate?.message}
          {...register('purchaseDate', { required: 'Purchase date is required' })}
        />
      </div>

      {/* Quantity and Prices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Quantity"
          type="number"
          step="0.00001"
          min="0"
          placeholder="0"
          leftIcon={<Hash className="w-4 h-4" />}
          error={errors.quantity?.message}
          {...register('quantity', {
            required: 'Quantity is required',
            min: { value: 0.00001, message: 'Quantity must be greater than 0' }
          })}
        />

        <Input
          label="Purchase Price"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-4 h-4" />}
          error={errors.purchasePrice?.message}
          {...register('purchasePrice', {
            required: 'Purchase price is required',
            min: { value: 0.01, message: 'Price must be greater than 0' }
          })}
        />

        <Input
          label="Current Price"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          leftIcon={<TrendingUp className="w-4 h-4" />}
          error={errors.currentPrice?.message}
          {...register('currentPrice', {
            required: 'Current price is required',
            min: { value: 0.01, message: 'Price must be greater than 0' }
          })}
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
            ? (isEditing ? 'Updating...' : 'Adding...') 
            : (isEditing ? 'Update Investment' : 'Add Investment')
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
