import React from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank,
  CreditCard,
  Target
} from 'lucide-react'
import Card from '../ui/Card'
import clsx from 'clsx'

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color = 'primary' 
}) => {
  const colorClasses = {
    primary: 'bg-primary-500 text-primary-50',
    success: 'bg-green-500 text-green-50',
    warning: 'bg-yellow-500 text-yellow-50',
    error: 'bg-red-500 text-red-50',
  }

  const changeColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
          {change && (
            <div className={clsx('flex items-center mt-2 text-sm', changeColors[changeType])}>
              {changeType === 'positive' && <TrendingUp className="w-4 h-4 mr-1" />}
              {changeType === 'negative' && <TrendingDown className="w-4 h-4 mr-1" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={clsx('p-3 rounded-full', colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  )
}

export default function QuickStats({ summary }) {
  const formatCurrency = (amount) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value) => {
    if (!value) return '0%'
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return null
    return ((current - previous) / previous) * 100
  }

  const stats = [
    {
      title: 'Total Balance',
      value: formatCurrency(summary?.netWorth || 0),
      change: formatPercentage(calculateChange(summary?.netWorth, 50000)),
      changeType: summary?.netWorth > 50000 ? 'positive' : 'negative',
      icon: DollarSign,
      color: 'primary'
    },
    {
      title: 'Monthly Income', 
      value: formatCurrency(summary?.income || 0),
      change: formatPercentage(calculateChange(summary?.income, 8000)),
      changeType: summary?.income > 8000 ? 'positive' : 'negative',
      icon: TrendingUp,
      color: 'success'
    },
    {
      title: 'Monthly Expenses',
      value: formatCurrency(summary?.expenses || 0),
      change: formatPercentage(calculateChange(summary?.expenses, 5000)),
      changeType: summary?.expenses < 5000 ? 'positive' : 'negative',
      icon: CreditCard,
      color: 'error'
    },
    {
      title: 'Total Savings',
      value: formatCurrency(summary?.savings || 0),
      change: formatPercentage(calculateChange(summary?.savings, 15000)),
      changeType: summary?.savings > 15000 ? 'positive' : 'negative',
      icon: PiggyBank,
      color: 'warning'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}
