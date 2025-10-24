import React from 'react'
import { TrendingUp, AlertTriangle, Lightbulb, Target, CheckCircle } from 'lucide-react'
import Badge from '../ui/Badge'

const INSIGHT_ICONS = {
  spending_pattern: TrendingUp,
  savings_opportunity: CheckCircle,
  budget_alert: AlertTriangle,
  goal_achievement: Target,
  recommendation: Lightbulb
}

const INSIGHT_COLORS = {
  spending_pattern: {
    icon: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-800'
  },
  savings_opportunity: {
    icon: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-200 dark:border-green-800'
  },
  budget_alert: {
    icon: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
    border: 'border-red-200 dark:border-red-800'
  },
  goal_achievement: {
    icon: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    border: 'border-purple-200 dark:border-purple-800'
  },
  recommendation: {
    icon: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    border: 'border-amber-200 dark:border-amber-800'
  }
}

export default function AIInsightCard({ insight }) {
  const Icon = INSIGHT_ICONS[insight.type] || Lightbulb
  const colors = INSIGHT_COLORS[insight.type] || INSIGHT_COLORS.recommendation
  
  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      default: return 'success'
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border-2 ${colors.border} p-6 hover:shadow-xl transition-all duration-300 animate-in slide-in-from-bottom`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className={`p-4 ${colors.bg} rounded-2xl`}>
            <Icon className={`w-7 h-7 ${colors.icon}`} />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3 gap-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {insight.title}
            </h3>
            <Badge variant={getPriorityVariant(insight.priority)} size="sm">
              {insight.priority}
            </Badge>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
            {insight.description}
          </p>
          
          {insight.details && insight.details.length > 0 && (
            <ul className="space-y-2 mb-4">
              {insight.details.map((detail, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${colors.bg}`} />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          )}
          
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            {insight.confidence && (
              <div className="flex items-center gap-2">
                <div className="w-full max-w-[120px] bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${colors.bg.replace('/30', '')}`}
                    style={{ width: `${Math.round(insight.confidence * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {Math.round(insight.confidence * 100)}%
                </span>
              </div>
            )}
            
            {insight.impact?.potential_savings && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-bold text-green-700 dark:text-green-300">
                  Save {formatCurrency(insight.impact.potential_savings)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
