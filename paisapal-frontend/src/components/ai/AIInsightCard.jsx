// src/components/ai/AIInsightCard.jsx
import React from 'react'
import { TrendingUp, AlertTriangle, Lightbulb, Target, DollarSign } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'

const INSIGHT_ICONS = {
  spending_pattern: TrendingUp,
  savings_opportunity: DollarSign,
  budget_alert: AlertTriangle,
  goal_achievement: Target,
  recommendation: Lightbulb
}

const INSIGHT_COLORS = {
  spending_pattern: 'text-blue-600',
  savings_opportunity: 'text-green-600',
  budget_alert: 'text-red-600',
  goal_achievement: 'text-purple-600',
  recommendation: 'text-yellow-600'
}

export default function AIInsightCard({ insight }) {
  const Icon = INSIGHT_ICONS[insight.type] || Lightbulb
  const iconColor = INSIGHT_COLORS[insight.type] || 'text-gray-600'
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      default: return 'success'
    }
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {insight.title}
            </h3>
            <Badge variant={getPriorityColor(insight.priority)} size="sm">
              {insight.priority}
            </Badge>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {insight.description}
          </p>
          
          {insight.details && insight.details.length > 0 && (
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
              {insight.details.map((detail, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                  {detail}
                </li>
              ))}
            </ul>
          )}
          
          <div className="flex items-center justify-between">
            {insight.confidence && (
              <Badge variant="secondary" size="sm">
                {Math.round(insight.confidence * 100)}% confidence
              </Badge>
            )}
            
            {insight.impact?.potential_savings && (
              <span className="text-sm font-medium text-green-600">
                Save ${insight.impact.potential_savings}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
