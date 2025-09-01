import React, { useState, useMemo } from 'react'
import { 
  Brain, TrendingUp, TrendingDown, Target, AlertCircle, 
  Lightbulb, MessageSquare, RefreshCw, Sparkles, Calculator,
  PiggyBank, CreditCard, BarChart3, ArrowRight
} from 'lucide-react'
import { useGetAIInsightsQuery, useGetPredictionsQuery } from '../../services/aiApi'
import { useGetTransactionsQuery } from '../../services/transactionApi'
import { useGetBudgetsQuery } from '../../services/budgetApi'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import Progress from '../ui/Progress'
import LoadingSpinner from '../common/LoadingSpinner'
import AIChat from './AIChat'

const INSIGHT_TYPES = {
  spending_pattern: {
    icon: TrendingDown,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    title: 'Spending Pattern Analysis'
  },
  savings_opportunity: {
    icon: PiggyBank,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    title: 'Savings Opportunity'
  },
  budget_optimization: {
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    title: 'Budget Optimization'
  },
  investment_suggestion: {
    icon: TrendingUp,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    title: 'Investment Suggestion'
  },
  anomaly_detection: {
    icon: AlertCircle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/20',
    title: 'Unusual Activity'
  }
}

function InsightCard({ insight, onAction }) {
  const typeConfig = INSIGHT_TYPES[insight.type] || INSIGHT_TYPES.spending_pattern
  const Icon = typeConfig.icon

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      default: return 'success'
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary-500">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-full ${typeConfig.bgColor}`}>
              <Icon className={`w-6 h-6 ${typeConfig.color}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {typeConfig.title}
              </h3>
              <Badge variant={getPriorityColor(insight.priority)} size="sm">
                {insight.priority} priority
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" size="sm">
              {Math.round(insight.confidence * 100)}% confidence
            </Badge>
            <Sparkles className="w-4 h-4 text-primary-500" />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            {insight.description}
          </p>

          {/* Insight Details */}
          {insight.details && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Key Details:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {insight.details.map((detail, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Impact Metrics */}
          {insight.impact && (
            <div className="grid grid-cols-2 gap-4">
              {insight.impact.potential_savings && (
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Potential Savings</p>
                  <p className="text-lg font-bold text-green-600">
                    ${insight.impact.potential_savings}
                  </p>
                </div>
              )}
              {insight.impact.time_frame && (
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Time Frame</p>
                  <p className="text-lg font-bold text-blue-600">
                    {insight.impact.time_frame}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Recommended Actions */}
          {insight.recommended_actions && insight.recommended_actions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Recommended Actions:
              </h4>
              <div className="flex flex-wrap gap-2">
                {insight.recommended_actions.map((action, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="secondary"
                    onClick={() => onAction && onAction(action)}
                    rightIcon={<ArrowRight className="w-3 h-3" />}
                  >
                    {action.title}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

function SpendingForecast({ predictions }) {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  const forecastData = predictions?.spending_forecast || []
  const filteredData = forecastData.filter(item => 
    selectedPeriod === '7d' ? item.period <= 7 :
    selectedPeriod === '30d' ? item.period <= 30 : true
  )

  return (
    <Card>
      <Card.Header>
        <Card.Title className="flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          AI Spending Forecast
        </Card.Title>
        <div className="flex space-x-2">
          {['7d', '30d', '90d'].map((period) => (
            <Button
              key={period}
              size="sm"
              variant={selectedPeriod === period ? 'primary' : 'secondary'}
              onClick={() => setSelectedPeriod(period)}
            >
              {period === '7d' ? '7 Days' : 
               period === '30d' ? '30 Days' : '3 Months'}
            </Button>
          ))}
        </div>
      </Card.Header>

      <Card.Content>
        <div className="space-y-4">
          {filteredData.map((forecast, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {forecast.category}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Next {forecast.period} days
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ${forecast.predicted_amount}
                </p>
                <p className={`text-sm ${
                  forecast.trend === 'up' ? 'text-red-600' : 
                  forecast.trend === 'down' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {forecast.trend === 'up' ? '↗' : forecast.trend === 'down' ? '↘' : '→'} 
                  {forecast.confidence}% confidence
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  )
}

function PersonalizedTips({ insights }) {
  const tips = useMemo(() => {
    return insights.filter(insight => 
      insight.type === 'savings_opportunity' || 
      insight.type === 'budget_optimization'
    ).slice(0, 3)
  }, [insights])

  return (
    <Card>
      <Card.Header>
        <Card.Title className="flex items-center">
          <Lightbulb className="w-5 h-5 mr-2" />
          Personalized Financial Tips
        </Card.Title>
      </Card.Header>

      <Card.Content>
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {tip.title || 'Smart Tip'}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {tip.description}
                </p>
                {tip.impact?.potential_savings && (
                  <p className="text-sm font-medium text-green-600 mt-2">
                    💰 Save up to ${tip.impact.potential_savings}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  )
}

export default function AIInsightsCenter() {
  const [refreshing, setRefreshing] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Fetch data from your AI APIs
  const { data: insightsData, isLoading: insightsLoading, refetch: refetchInsights } = useGetAIInsightsQuery()
  const { data: predictionsData, isLoading: predictionsLoading } = useGetPredictionsQuery()
  const { data: transactionsData } = useGetTransactionsQuery({ limit: 100 })
  const { data: budgetsData } = useGetBudgetsQuery()

  const insights = insightsData?.insights || []
  const predictions = predictionsData?.predictions || {}

  // Filter insights by category
  const filteredInsights = insights.filter(insight => 
    selectedCategory === 'all' || insight.type === selectedCategory
  )

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetchInsights()
    setRefreshing(false)
  }

  const handleActionClick = (action) => {
    // Handle recommended action clicks
    console.log('Action clicked:', action)
    // Navigate to relevant page or show modal based on action type
  }

  if (insightsLoading || predictionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Analyzing your financial data..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-primary-500 to-blue-500 text-white rounded-full">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Financial Insights
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Personalized recommendations powered by machine learning
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            leftIcon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Refresh
          </Button>
          
          <Button
            leftIcon={<MessageSquare className="w-4 h-4" />}
            onClick={() => setShowChat(true)}
          >
            Ask AI Assistant
          </Button>
        </div>
      </div>

      {/* Quick AI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6 text-center">
            <Calculator className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Total Insights
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {insights.length}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Savings Opportunities
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {insights.filter(i => i.type === 'savings_opportunity').length}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Alerts
            </h3>
            <p className="text-2xl font-bold text-amber-600">
              {insights.filter(i => i.priority === 'high').length}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6 text-center">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Optimizations
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {insights.filter(i => i.type === 'budget_optimization').length}
            </p>
          </div>
        </Card>
      </div>

      {/* Category Filter */}
      <Card>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'spending_pattern', 'savings_opportunity', 'budget_optimization', 'investment_suggestion', 'anomaly_detection'].map((category) => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? 'primary' : 'secondary'}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'All Insights' : 
                 INSIGHT_TYPES[category]?.title || category}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - AI Insights */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            {filteredInsights.length > 0 ? (
              filteredInsights.map((insight, index) => (
                <InsightCard
                  key={insight.id || index}
                  insight={insight}
                  onAction={handleActionClick}
                />
              ))
            ) : (
              <Card>
                <div className="p-8 text-center">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No insights available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Add more transactions and budgets to get personalized AI insights.
                  </p>
                </div>
              </Card>
            )}
          </div>
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
