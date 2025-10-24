import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns'
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import EmptyState from '../common/EmptyState'

export default function MonthlyOverview({ transactions = [], budgets = [] }) {
  const monthlyData = useMemo(() => {
    const endDate = new Date()
    const startDate = subMonths(endDate, 5) // Last 6 months
    
    const months = eachMonthOfInterval({ start: startDate, end: endDate })
    
    return months.map(month => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate >= monthStart && transactionDate <= monthEnd
      })
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
      const monthBudget = budgets
        .filter(b => b.period === 'monthly')
        .reduce((sum, b) => sum + (b.amount || 0), 0)
      
      return {
        month: format(month, 'MMM yyyy'),
        shortMonth: format(month, 'MMM'),
        income,
        expenses,
        budget: monthBudget,
        net: income - expenses
      }
    })
  }, [transactions, budgets])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4">
          <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">
            {data.month}
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between space-x-4">
              <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                Income
              </span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(data.income)}
              </span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Expenses
              </span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                {formatCurrency(data.expenses)}
              </span>
            </div>
            {data.budget > 0 && (
              <div className="flex items-center justify-between space-x-4">
                <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                  <span className="w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
                  Budget
                </span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(data.budget)}
                </span>
              </div>
            )}
            <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between space-x-4">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Net
                </span>
                <span className={`text-sm font-bold ${
                  data.net >= 0 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(data.net)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Calculate totals
  const totals = useMemo(() => {
    return monthlyData.reduce((acc, month) => ({
      income: acc.income + month.income,
      expenses: acc.expenses + month.expenses,
      net: acc.net + month.net
    }), { income: 0, expenses: 0, net: 0 })
  }, [monthlyData])

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-emerald-600" />
            Monthly Overview
          </h3>
        </div>
        <EmptyState 
          icon={Calendar}
          title="No transaction data"
          message="Add transactions to see your monthly income and expense trends"
        />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-emerald-600" />
            Monthly Overview
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last 6 months trend
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Total Income
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
            {formatCurrency(totals.income)}
          </p>
        </div>

        <div className="p-3 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-red-700 dark:text-red-300">
              Total Expenses
            </span>
            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-lg font-bold text-red-700 dark:text-red-300">
            {formatCurrency(totals.expenses)}
          </p>
        </div>

        <div className={`p-3 rounded-lg border ${
          totals.net >= 0
            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800'
            : 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-medium ${
              totals.net >= 0
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-orange-700 dark:text-orange-300'
            }`}>
              Net Savings
            </span>
            {totals.net >= 0 ? (
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            )}
          </div>
          <p className={`text-lg font-bold ${
            totals.net >= 0
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-orange-700 dark:text-orange-300'
          }`}>
            {formatCurrency(totals.net)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              className="opacity-30" 
              stroke="currentColor"
              strokeOpacity={0.1}
            />
            <XAxis 
              dataKey="shortMonth" 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-gray-600 dark:text-gray-400"
              tickFormatter={(value) => `₹${value/1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <Bar 
              dataKey="income" 
              fill="#10b981" 
              radius={[8, 8, 0, 0]}
              name="Income"
            />
            <Bar 
              dataKey="expenses" 
              fill="#ef4444" 
              radius={[8, 8, 0, 0]}
              name="Expenses"
            />
            {budgets.length > 0 && (
              <Bar 
                dataKey="budget" 
                fill="#f59e0b" 
                opacity={0.5}
                radius={[8, 8, 0, 0]}
                name="Budget"
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
