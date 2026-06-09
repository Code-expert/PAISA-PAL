import React from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  PiggyBank
} from 'lucide-react'

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  colorClass = 'primary'
}) => {
  const colorMap = {
    primary: {
      borderHover: 'hover:border-primary/40',
      iconBg: 'bg-primary/10',
      iconText: 'text-primary',
      badgeText: 'text-primary',
      badgeBg: 'bg-primary/10',
      valueText: 'text-on-surface'
    },
    secondary: {
      borderHover: 'hover:border-primary/40',
      iconBg: 'bg-secondary/10',
      iconText: 'text-secondary',
      badgeText: 'text-on-surface-variant',
      badgeBg: 'bg-transparent',
      valueText: 'text-primary'
    },
    error: {
      borderHover: 'hover:border-error/40',
      iconBg: 'bg-error/10',
      iconText: 'text-error',
      badgeText: 'text-on-surface-variant',
      badgeBg: 'bg-transparent',
      valueText: 'text-on-surface'
    },
    primaryFixed: {
      borderHover: 'hover:border-primary/40',
      iconBg: 'bg-primary-fixed-dim/10',
      iconText: 'text-primary-fixed-dim',
      badgeText: 'text-primary',
      badgeBg: 'bg-primary/10',
      valueText: 'text-on-surface'
    }
  }

  const c = colorMap[colorClass] || colorMap.primary

  return (
    <div className={`bg-surface-container/40 backdrop-blur-md p-6 rounded-2xl border border-outline-variant/30 ${c.borderHover} transition-colors group relative overflow-hidden`}>
      {colorClass === 'primaryFixed' && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 ${c.iconBg} rounded-lg ${c.iconText}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className={`${c.badgeText} text-[10px] font-bold ${c.badgeBg} px-2 py-1 rounded-full uppercase`}>
          {change}
        </span>
      </div>
      <p className="text-on-surface-variant text-sm font-label mb-1">{title}</p>
      <h3 className={`text-2xl font-bold ${c.valueText} tracking-tight`}>{value}</h3>
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
      colorClass: 'primary'
    },
    {
      title: 'Monthly Income', 
      value: formatCurrency(summary?.income || 0),
      change: summary?.income > 0 ? `This Month` : 'No data yet',
      changeType: summary?.income > 0 ? 'positive' : 'neutral',
      icon: TrendingUp,
      colorClass: 'secondary'
    },
    {
      title: 'Monthly Expenses',
      value: formatCurrency(summary?.expenses || 0),
      change: summary?.expenses > 0 ? `This Month` : 'No data yet',
      changeType: summary?.expenses > 0 ? 'positive' : 'neutral',
      icon: TrendingDown,
      colorClass: 'error'
    },
    {
      title: 'Net Worth',
      value: formatCurrency(summary?.savings || 0),
      change: summary?.savingsRate ? `Record High` : 'Keep tracking!',
      changeType: (summary?.savings || 0) >= 0 ? 'positive' : 'negative',
      icon: PiggyBank,
      colorClass: 'primaryFixed'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <StatCard {...stat} />
        </div>
      ))}
    </div>
  )
}
