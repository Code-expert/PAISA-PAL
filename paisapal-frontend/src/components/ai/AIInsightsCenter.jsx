import React, { useState, useMemo } from 'react'
import { 
  Brain, TrendingUp, TrendingDown, Target, AlertCircle, 
  Lightbulb, MessageSquare, RefreshCw, Sparkles, Calculator,
  PiggyBank, BarChart3, ArrowRight
} from 'lucide-react'
import { useGetAIInsightsQuery, useGetPredictionsQuery } from '../../services/aiApi'
import { useGetTransactionsQuery } from '../../services/transactionApi'
import { useGetBudgetsQuery } from '../../services/budgetApi'
import LoadingSpinner from '../common/LoadingSpinner'
import AIChat from './AIChat'
import Badge from '../ui/Badge'

const INSIGHT_TYPES = {
  spending_pattern: {
    icon: TrendingDown,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    borderColor: 'border-red-500',
    title: 'Spending Pattern Analysis'
  },
  savings_opportunity: {
    icon: PiggyBank,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    borderColor: 'border-green-500',
    title: 'Savings Opportunity'
  },
  budget_optimization: {
    icon: Target,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    borderColor: 'border-blue-500',
    title: 'Budget Optimization'
  },
  investment_suggestion: {
    icon: TrendingUp,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    borderColor: 'border-purple-500',
    title: 'Investment Suggestion'
  },
  anomaly_detection: {
    icon: AlertCircle,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/20',
    borderColor: 'border-amber-500',
    title: 'Unusual Activity'
  }
}

function InsightCard({ insight, onAction }) {
  const typeConfig = INSIGHT_TYPES[insight.type] || INSIGHT_TYPES.spending_pattern
  const Icon = typeConfig.icon

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
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border-l-4 ${typeConfig.borderColor} border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${typeConfig.bgColor}`}>
            <Icon className={`w-6 h-6 ${typeConfig.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {typeConfig.title}
            </h3>
            <Badge variant={getPriorityVariant(insight.priority)} size="sm">
              {insight.priority} priority
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" size="sm">
            {Math.round(insight.confidence * 100)}%
          </Badge>
          <Sparkles className="w-4 h-4 text-emerald-500" />
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {insight.description}
        </p>

        {insight.details && insight.details.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Key Details:
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {insight.details.map((detail, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        )}

        {insight.impact && (
          <div className="grid grid-cols-2 gap-4">
            {insight.impact.potential_savings && (
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Potential Savings</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(insight.impact.potential_savings)}
                </p>
              </div>
            )}
            {insight.impact.time_frame && (
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Time Frame</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {insight.impact.time_frame}
                </p>
              </div>
            )}
          </div>
        )}

        {insight.recommended_actions && insight.recommended_actions.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Recommended Actions:
            </h4>
            <div className="flex flex-wrap gap-2">
              {insight.recommended_actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => onAction && onAction(action)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                >
                  {action.title}
                  <ArrowRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SpendingForecast({ predictions }) {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  const forecastData = predictions?.spending_forecast || []
  const filteredData = forecastData.filter(item => 
    selectedPeriod === '7d' ? item.period <= 7 :
    selectedPeriod === '30d' ? item.period <= 30 : true
  )

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          AI Spending Forecast
        </h3>
      </div>

      <div className="flex gap-2 mb-4">
        {['7d', '30d', '90d'].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
              selectedPeriod === period
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '3 Months'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredData.length > 0 ? filteredData.map((forecast, index) => (
          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {forecast.category}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Next {forecast.period} days
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(forecast.predicted_amount)}
              </p>
              <p className={`text-sm font-medium ${
                forecast.trend === 'up' ? 'text-red-600 dark:text-red-400' : 
                forecast.trend === 'down' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {forecast.trend === 'up' ? '↗' : forecast.trend === 'down' ? '↘' : '→'} 
                {forecast.confidence}% confident
              </p>
            </div>
          </div>
        )) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No forecast data available</p>
        )}
      </div>
    </div>
  )
}

function PersonalizedTips({ insights }) {
  const tips = useMemo(() => {
    return insights.filter(insight => 
      insight.type === 'savings_opportunity' || 
      insight.type === 'budget_optimization'
    ).slice(0, 3)
  }, [insights])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-emerald-600" />
        Personalized Financial Tips
      </h3>

      <div className="space-y-3">
        {tips.length > 0 ? tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {index + 1}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                {tip.title || 'Smart Tip'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {tip.description}
              </p>
              {tip.impact?.potential_savings && (
                <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-2">
                  💰 Save up to {formatCurrency(tip.impact.potential_savings)}
                </p>
              )}
            </div>
          </div>
        )) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">Add more data to get personalized tips</p>
        )}
      </div>
    </div>
  )
}

export default function AIInsightsCenter() {
  const [refreshing, setRefreshing] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const { data: insightsData, isLoading: insightsLoading, refetch: refetchInsights } = useGetAIInsightsQuery()
  const { data: predictionsData, isLoading: predictionsLoading } = useGetPredictionsQuery()
  const { data: transactionsData } = useGetTransactionsQuery({ limit: 100 })
  const { data: budgetsData } = useGetBudgetsQuery()

  const insights = insightsData?.insights || []
  const predictions = predictionsData?.predictions || {}

  const filteredInsights = insights.filter(insight => 
    selectedCategory === 'all' || insight.type === selectedCategory
  )

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetchInsights()
    setRefreshing(false)
  }

  const handleActionClick = (action) => {
    console.log('Action clicked:', action)
  }

  if (insightsLoading || predictionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Analyzing your financial data..." />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              AI Financial Insights
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Personalized recommendations powered by machine learning
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={() => setShowChat(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
          >
            <MessageSquare className="w-4 h-4" />
            Ask AI Assistant
          </button>
        </div>
      </div>

      {/* Quick AI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Calculator, color: 'text-emerald-600', label: 'Total Insights', value: insights.length },
          { icon: TrendingUp, color: 'text-green-600', label: 'Savings Opportunities', value: insights.filter(i => i.type === 'savings_opportunity').length },
          { icon: AlertCircle, color: 'text-amber-600', label: 'Alerts', value: insights.filter(i => i.priority === 'high').length },
          { icon: Target, color: 'text-blue-600', label: 'Optimizations', value: insights.filter(i => i.type === 'budget_optimization').length }
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
              <Icon className={`w-10 h-10 ${stat.color} mb-3`} />
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {stat.label}
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* Category Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap gap-2">
          {['all', ...Object.keys(INSIGHT_TYPES)].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category === 'all' ? 'All Insights' : INSIGHT_TYPES[category]?.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - AI Insights */}
        <div className="lg:col-span-2 space-y-4">
          {filteredInsights.length > 0 ? (
            filteredInsights.map((insight, index) => (
              <InsightCard
                key={insight.id || index}
                insight={insight}
                onAction={handleActionClick}
              />
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No insights available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Add more transactions and budgets to get personalized AI insights
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Predictions & Tips */}
        <div className="space-y-6">
          <SpendingForecast predictions={predictions} />
          <PersonalizedTips insights={insights} />
        </div>
      </div>

      {/* AI Chat Assistant */}
      {showChat && (
        <AIChat
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          userTransactions={transactionsData?.transactions || []}
          userBudgets={budgetsData?.budgets || []}
        />
      )}
    </div>
  )
}
