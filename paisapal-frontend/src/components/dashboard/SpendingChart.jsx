import React, { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { TrendingUp } from 'lucide-react'
import EmptyState from '../common/EmptyState'

export default function SpendingChart({ transactions = [], defaultPeriod = '30d' }) {
  const [period, setPeriod] = useState(defaultPeriod)

  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return []

    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const endDate = new Date()
    const startDate = subDays(endDate, days - 1)
    
    const allDates = eachDayOfInterval({ start: startDate, end: endDate })
    
    const dailyTotals = allDates.reduce((acc, date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      acc[dateStr] = {
        date: format(date, period === '7d' ? 'EEE' : 'MMM dd'),
        fullDate: dateStr,
        income: 0,
        expenses: 0,
        net: 0
      }
      return acc
    }, {})

    transactions.forEach(transaction => {
      const transactionDate = format(new Date(transaction.date), 'yyyy-MM-dd')
      if (dailyTotals[transactionDate]) {
        if (transaction.type === 'income') {
          dailyTotals[transactionDate].income += Math.abs(transaction.amount)
        } else if (transaction.type === 'expense') {
          dailyTotals[transactionDate].expenses += Math.abs(transaction.amount)
        }
        dailyTotals[transactionDate].net = 
          dailyTotals[transactionDate].income - dailyTotals[transactionDate].expenses
      }
    })

    return Object.values(dailyTotals)
  }, [transactions, period])

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

  const periods = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ]

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
            Spending Trends
          </h3>
        </div>
        <EmptyState 
          icon={TrendingUp}
          title="No transaction data"
          message="Add transactions to see your spending trends over time"
        />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg">
      {/* Header with Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
            Spending Trends
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track your income and expenses
          </p>
        </div>
        
        {/* Period Filter */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {periods.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all duration-200 ${
                period === value
                  ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
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
  