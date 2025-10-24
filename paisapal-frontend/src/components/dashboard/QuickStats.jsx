import React from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  PiggyBank
} from 'lucide-react'
import clsx from 'clsx'

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  gradient 
}) => {
  const changeColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  }

  return (
    <div className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Subtle background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 dark:opacity-10`} />
      
      {/* Content */}
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {value}
          </p>
          {change && (
            <div className={clsx('flex items-center text-sm font-semibold', changeColors[changeType])}>
              {changeType === 'positive' && <TrendingUp className="w-4 h-4 mr-1" />}
              {changeType === 'negative' && <TrendingDown className="w-4 h-4 mr-1" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  )
}

export default function QuickStats({ summary }) {
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value) => {
    if (!value) return '0%'
    const absValue = Math.abs(value)
    return `${value > 0 ? '+' : ''}${absValue.toFixed(1)}%`
  }

  const stats = [
    {
      title: 'Total Balance',
      value: formatCurrency(summary?.netWorth || 0),
      change: 'Current balance',
      changeType: 'neutral',
      icon: Wallet,
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Monthly Income', 
      value: formatCurrency(summary?.income || 0),
      change: summary?.income > 0 ? `${formatPercentage(10)} vs last month` : 'No data yet',
      changeType: summary?.income > 0 ? 'positive' : 'neutral',
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Monthly Expenses',
      value: formatCurrency(summary?.expenses || 0),
      change: summary?.expenses > 0 ? `${formatPercentage(-5)} vs last month` : 'No data yet',
      changeType: summary?.expenses > 0 ? 'positive' : 'neutral',
      icon: TrendingDown,
      gradient: 'from-red-500 to-pink-600'
    },
    {
      title: 'Total Savings',
      value: formatCurrency(summary?.savings || 0),
      change: summary?.savingsRate ? `${summary.savingsRate.toFixed(1)}% savings rate` : 'Keep tracking!',
      changeType: (summary?.savings || 0) >= 0 ? 'positive' : 'negative',
      icon: PiggyBank,
      gradient: 'from-amber-500 to-orange-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="animate-in slide-in-from-bottom duration-500"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <StatCard {...stat} />
        </div>
      ))}
    </div>
  )
}
