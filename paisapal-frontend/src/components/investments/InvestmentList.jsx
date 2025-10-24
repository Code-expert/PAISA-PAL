import React, { useState } from 'react'
import { Edit2, Trash2, TrendingUp, TrendingDown, Briefcase } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import { useDeleteInvestmentMutation } from '../../services/investmentApi'

export default function InvestmentList({ investments = [], onEdit }) {
  const [sortBy, setSortBy] = useState('purchaseDate')
  const [sortOrder, setSortOrder] = useState('desc')
  const [deleteInvestment] = useDeleteInvestmentMutation()

  const sortedInvestments = [...investments].sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    }
    return aValue < bValue ? 1 : -1
  })

  const getGainLoss = (investment) => {
    const currentValue = investment.currentPrice * investment.quantity
    const purchaseValue = investment.purchasePrice * investment.quantity
    const gain = currentValue - purchaseValue
    const percentage = ((gain / purchaseValue) * 100).toFixed(2)
    
    return { gain, percentage }
  }

  const handleDelete = async (investment) => {
    if (window.confirm(`Delete ${investment.symbol}? This action cannot be undone.`)) {
      try {
        await deleteInvestment(investment._id).unwrap()
        toast.success('Investment deleted successfully!', { icon: '🗑️' })
      } catch (error) {
        toast.error('Failed to delete investment')
      }
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getTypeEmoji = (type) => {
    const emojis = {
      stock: '📈',
      bond: '📜',
      etf: '📊',
      mutual_fund: '💼',
      crypto: '₿',
      real_estate: '🏠'
    }
    return emojis[type] || '💰'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-emerald-600" />
          Investment Holdings
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {investments.length} investment{investments.length !== 1 ? 's' : ''} in your portfolio
        </p>
      </div>
      
      <div className="p-6">
        {investments.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">
              No investments added yet
            </p>
            <button
              onClick={() => onEdit(null)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg"
            >
              Add Your First Investment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Symbol
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                    Current Value
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                    Gain/Loss
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedInvestments.map((investment) => {
                  const { gain, percentage } = getGainLoss(investment)
                  const currentValue = investment.currentPrice * investment.quantity
                  const isPositive = gain >= 0

                  return (
                    <tr 
                      key={investment._id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getTypeEmoji(investment.type)}</span>
                          <span className="font-bold text-gray-900 dark:text-white uppercase">
                            {investment.symbol}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-gray-700 dark:text-gray-300 max-w-40 truncate">
                          {investment.name}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
                          {investment.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {investment.quantity}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          @ {formatCurrency(investment.currentPrice)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(currentValue)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Cost: {formatCurrency(investment.purchasePrice * investment.quantity)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className={`flex items-center justify-end gap-1 font-bold ${
                          isPositive 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {isPositive ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span>
                            {isPositive ? '+' : ''}{formatCurrency(gain)}
                          </span>
                        </div>
                        <div className={`text-xs font-semibold ${
                          isPositive 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {isPositive ? '+' : ''}{percentage}%
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-gray-700 dark:text-gray-300">
                          {format(new Date(investment.purchaseDate), 'dd MMM yyyy')}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEdit(investment)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            title="Edit investment"
                          >
                            <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(investment)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete investment"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
