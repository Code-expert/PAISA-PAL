import React, { useState, useMemo } from 'react'
import { 
  TrendingUp, TrendingDown, DollarSign, PiggyBank, 
  Plus, ArrowUpRight, ArrowDownRight, Calendar,
  Target, CreditCard, Wallet, BarChart3
} from 'lucide-react'
import { useGetTransactionsQuery } from '../services/transactionApi'
import { useGetBudgetsQuery } from '../services/budgetApi'
import { useGetFinancialSummaryQuery } from '../services/financialApi'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import QuickStats from '../components/dashboard/QuickStats'
import RecentTransactions from '../components/dashboard/RecentTransactions'
import BudgetProgress from '../components/dashboard/BudgetProgress'
import SpendingChart from '../components/dashboard/SpendingChart'
import QuickActions from '../components/dashboard/QuickActions'
import MonthlyOverview from '../components/dashboard/MonthlyOverview'
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown'
import { useGetBillRemindersQuery } from '../services/billReminderApi'


export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  
  // Fetch data from your existing APIs
  const { data: transactionsData, isLoading: transactionsLoading } = useGetTransactionsQuery({
    limit: 50,
    sortBy: 'date-desc'
  })
  
  const { data: budgetsData, isLoading: budgetsLoading } = useGetBudgetsQuery()
  const { data: financialSummary, isLoading: summaryLoading } = useGetFinancialSummaryQuery()

const transactions = transactionsData?.transactions || [];
const budgets = budgetsData?.budgets || [] 

  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
  const now = new Date()
  let fromDate

  // Calculate date range based on selected period
  switch (selectedPeriod) {
    case '7d':
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '90d':
      fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case '1y':
      fromDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    default:
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  // Filter transactions based on selected period
  const filteredTransactions = transactions.filter(t =>
    new Date(t.date) >= fromDate
  )

  const income = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const netIncome = income - expenses
  const savingsRate = income > 0 ? ((netIncome / income) * 100) : 0

  return {
    totalIncome: income,
    totalExpenses: expenses,
    netIncome,
    savingsRate,
    transactionCount: filteredTransactions.length
  }
}, [transactions, selectedPeriod]) 


  const isLoading = transactionsLoading || budgetsLoading || summaryLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Financial Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your expenses, monitor budgets, and achieve your financial goals
          </p>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          {['7d', '30d', '90d', '1y'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period === '7d' ? 'Week' : 
               period === '30d' ? 'Month' : 
               period === '90d' ? '3 Months' : 'Year'}
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStatsInternal 
        metrics={financialMetrics}
        financialSummary={financialSummary}
        isLoading={isLoading}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Charts and Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Spending Trends Chart */}
          <SpendingChart 
            transactions={transactions}
            period={selectedPeriod}
          />
          
          {/* Monthly Overview */}
          <MonthlyOverview 
            transactions={transactions}
            budgets={budgets}
          />
          
          {/* Category Breakdown */}
          <CategoryBreakdown 
            transactions={transactions}
          />
        </div>

        {/* Right Column - Quick Actions & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions />
          
          {/* Budget Progress */}
          <BudgetProgress 
            budgets={budgets}
          />
          
          {/* Recent Transactions */}
          <RecentTransactions 
            transactions={transactions.slice(0, 5)}
          />
          
          {/* Financial Goals */}
          <FinancialGoals
            metrics={financialMetrics}
          />
        </div>
      </div>

      {/* Bottom Section - Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SmartInsights transactions={transactions} />
        <UpcomingBills />
      </div>
    </div>
  )
}

// Enhanced QuickStats Component
function QuickStatsInternal({ metrics, financialSummary, isLoading }) {
  const stats = [
    {
      title: 'Total Income',
      value: `$${metrics.totalIncome.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
      change: '+12.5%',
      changeType: 'increase'
    },
    {
      title: 'Total Expenses',
      value: `$${metrics.totalExpenses.toLocaleString()}`,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900',
      change: '+8.2%',
      changeType: 'increase'
    },
    {
      title: 'Net Income',
      value: `$${metrics.netIncome.toLocaleString()}`,
      icon: DollarSign,
      color: metrics.netIncome >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: metrics.netIncome >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900',
      change: `${metrics.savingsRate.toFixed(1)}%`,
      changeType: metrics.netIncome >= 0 ? 'increase' : 'decrease'
    },
    {
      title: 'Savings Rate',
      value: `${metrics.savingsRate.toFixed(1)}%`,
      icon: PiggyBank,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      change: 'Target: 20%',
      changeType: 'neutral'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              
              <div className="flex items-center mt-4">
                {stat.changeType === 'increase' && (
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                )}
                {stat.changeType === 'decrease' && (
                  <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' :
                  stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

// Smart Insights Component
function SmartInsights({ transactions }) {
  const insights = useMemo(() => {
    // Calculate spending patterns and generate insights
    const categorySpending = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {})

    const topCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)[0]

    const avgDailySpending = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0) / 30

    return [
      {
        type: 'spending',
        title: 'Top Spending Category',
        description: `You spent most on ${topCategory?.[0] || 'N/A'} this month`,
        value: topCategory ? `$${topCategory[1].toFixed(2)}` : '$0',
        action: 'Review budget'
      },
      {
        type: 'trend',
        title: 'Daily Average',
        description: 'Your average daily spending',
        value: `$${avgDailySpending.toFixed(2)}`,
        action: 'Set daily limit'
      },
      {
        type: 'goal',
        title: 'Savings Opportunity',
        description: 'Reduce dining out by 20% to save',
        value: '$200/month',
        action: 'Create budget'
      }
    ]
  }, [transactions])

  return (
    <Card>
      <Card.Header>
        <Card.Title className="flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Smart Insights
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {insight.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {insight.description}
                </p>
                <p className="text-lg font-semibold text-primary-600 mt-2">
                  {insight.value}
                </p>
              </div>
              <Button size="sm" variant="secondary">
                {insight.action}
              </Button>
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  )
}

// Upcoming Bills Component
function UpcomingBills() {
  const { data: billsData, isLoading } = useGetBillRemindersQuery({ upcoming: true })
  const bills = billsData?.bills || []

  if (isLoading) {
    return (
      <Card>
        <Card.Header>
          <Card.Title className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Upcoming Bills
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </Card.Content>
      </Card>
    )
  }

  if (bills.length === 0) {
    return (
      <Card>
        <Card.Header>
          <Card.Title className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Upcoming Bills
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No upcoming bills
            </p>
            <Button variant="primary" size="sm" onClick={() => window.location.href = '/bills'}>
              Add Bill Reminder
            </Button>
          </div>
        </Card.Content>
      </Card>
    )
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Upcoming Bills
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="space-y-3">
          {bills.slice(0, 4).map((bill) => {
            const daysUntilDue = Math.ceil((new Date(bill.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
            const isOverdue = daysUntilDue < 0
            const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0
            
            return (
              <div key={bill._id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {bill.name}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className={`text-sm ${
                      isOverdue ? 'text-red-600 font-medium' :
                      isDueSoon ? 'text-yellow-600 font-medium' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {isOverdue 
                        ? `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`
                        : daysUntilDue === 0
                        ? 'Due today'
                        : daysUntilDue === 1
                        ? 'Due tomorrow'
                        : `Due in ${daysUntilDue} days`
                      }
                    </p>
                    {(isOverdue || isDueSoon) && (
                      <span className="text-xs">⚠️</span>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ${bill.amount.toFixed(2)}
                  </p>
                  <Badge 
                    variant={isOverdue ? 'error' : isDueSoon ? 'warning' : 'secondary'} 
                    size="sm"
                    className="mt-1"
                  >
                    {bill.category}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
        <Button 
          variant="secondary" 
          className="w-full mt-4"
          onClick={() => window.location.href = '/bills'}
        >
          View All Bills
        </Button>
      </Card.Content>
    </Card>
  )
}

// Financial Goals Component
function FinancialGoals({ metrics }) {
  const goals = [
    {
      title: 'Emergency Fund',
      current: 2500,
      target: 5000,
      color: 'bg-blue-500'
    },
    {
      title: 'Vacation Savings',
      current: 800,
      target: 2000,
      color: 'bg-green-500'
    },
    {
      title: 'Investment Goal',
      current: 1200,
      target: 3000,
      color: 'bg-purple-500'
    }
  ]

  return (
    <Card>
      <Card.Header>
        <Card.Title className="flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Financial Goals
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="space-y-4">
          {goals.map((goal, index) => {
            const progress = (goal.current / goal.target) * 100
            return (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {goal.title}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ${goal.current} / ${goal.target}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${goal.color}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {progress.toFixed(1)}% complete
                </p>
              </div>
            )
          })}
        </div>
      </Card.Content>
    </Card>
  )
}
