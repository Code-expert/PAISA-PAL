import React from 'react'
import { CreditCard, TrendingUp, PiggyBank, Target } from 'lucide-react'

export default function FinancialSummary({ data, period }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(value))
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Income */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl border border-blue-200 dark:border-blue-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400">Total Income</h4>
          <CreditCard className="w-5 h-5 text-blue-600" />
        </div>
        <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
          {formatCurrency(data?.totalIncome || 0)}
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Last {period}</p>
      </div>

      {/* Total Expenses */}
      <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl border border-red-200 dark:border-red-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Total Expenses</h4>
          <TrendingUp className="w-5 h-5 text-red-600" />
        </div>
        <p className="text-3xl font-bold text-red-900 dark:text-red-100">
          {formatCurrency(data?.totalExpenses || 0)}
        </p>
        <p className="text-xs text-red-600 dark:text-red-400 mt-2">Last {period}</p>
      </div>

      {/* Net Savings */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl border border-green-200 dark:border-green-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-green-700 dark:text-green-400">Net Savings</h4>
          <PiggyBank className="w-5 h-5 text-green-600" />
        </div>
        <p className="text-3xl font-bold text-green-900 dark:text-green-100">
          {formatCurrency((data?.totalIncome || 0) - (data?.totalExpenses || 0))}
        </p>
        <p className="text-xs text-green-600 dark:text-green-400 mt-2">Income - Expenses</p>
      </div>

      {/* Savings Rate */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl border border-purple-200 dark:border-purple-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-purple-700 dark:text-purple-400">Savings Rate</h4>
          <Target className="w-5 h-5 text-purple-600" />
        </div>
        <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
          {data?.totalIncome > 0 
            ? ((((data?.totalIncome || 0) - (data?.totalExpenses || 0)) / (data?.totalIncome || 1)) * 100).toFixed(1)
            : 0
          }%
        </p>
        <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">of income saved</p>
      </div>
    </div>
  )
}
