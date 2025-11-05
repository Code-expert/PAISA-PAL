import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, parseISO } from 'date-fns'
import { TrendingUp } from 'lucide-react'
import EmptyState from '../common/EmptyState'

export default function TransactionChart({ transactions = [], period = '7d' }) {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return []
    
    // Group transactions by date
    const dailyTotals = transactions.reduce((acc, transaction) => {
      const date = format(parseISO(transaction.date), 'yyyy-MM-dd')
      if (!acc[date]) {
        acc[date] = { date, income: 0, expenses: 0, net: 0 }
      }
      
      if (transaction.type === 'income') {
        acc[date].income += Math.abs(transaction.amount)
      } else if (transaction.type === 'expense') {
        acc[date].expenses += Math.abs(transaction.amount)
      }
      
      acc[date].net = acc[date].income - acc[date].expenses
      return acc
    }, {})
    
    // Convert to array and sort by date
    return Object.values(dailyTotals)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        ...item,
        date: format(new Date(item.date), 'MMM dd')
      }))
  }, [transactions])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {label}
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between space-x-4">
              <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Income
              </span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {formatCurrency(payload[0]?.value || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Expenses
              </span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                {formatCurrency(payload[1]?.value || 0)}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
            Spending Trend
          </h3>
        </div>
        <EmptyState 
          icon={TrendingUp}
          title="No transaction data"
          message="Add transactions to see your spending trends"
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
            <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
            Spending Trend
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Daily income and expenses
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="currentColor"
              className="opacity-20"
            />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-gray-600 dark:text-gray-400"
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-gray-600 dark:text-gray-400"
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `₹${value/1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              name="Income"
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#ef4444" 
              strokeWidth={3}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              name="Expenses"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
