import React, { useState, useMemo } from 'react'
import { 
  TrendingUp, Calendar, BarChart3, Target,
  AlertCircle
} from 'lucide-react'
import { useGetTransactionsQuery } from '../services/transactionApi'
import { useGetBudgetsQuery } from '../services/budgetApi'
import { useGetFinancialSummaryQuery } from '../services/financialApi'
import { useGetBillRemindersQuery } from '../services/billReminderApi'
import QuickStats from '../components/dashboard/QuickStats'
import RecentTransactions from '../components/dashboard/RecentTransactions'
import BudgetProgress from '../components/dashboard/BudgetProgress'
import SpendingChart from '../components/dashboard/SpendingChart'
import QuickActions from '../components/dashboard/QuickActions'
import MonthlyOverview from '../components/dashboard/MonthlyOverview'
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown'
import FinancialGoals from '../components/dashboard/FinancialGoals'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  
  const { data: transactionsData, isLoading: transactionsLoading } = useGetTransactionsQuery({
    limit: 50,
    sortBy: 'date-desc'
  })
  
  const { data: budgetsData, isLoading: budgetsLoading } = useGetBudgetsQuery()
  const { data: financialSummary, isLoading: summaryLoading } = useGetFinancialSummaryQuery()

  const transactions = transactionsData?.transactions || []
  const budgets = budgetsData?.budgets || []

  const financialMetrics = useMemo(() => {
    const now = new Date()
    let fromDate

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

    const filteredTransactions = transactions.filter(t =>
      new Date(t.date) >= fromDate
    )

    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const netIncome = income - expenses
    const savingsRate = income > 0 ? ((netIncome / income) * 100) : 0

    return {
      income,
      expenses,
      netWorth: netIncome,
      savings: netIncome,
      savingsRate,
      transactionCount: filteredTransactions.length
    }
  }, [transactions, selectedPeriod])

  const isLoading = transactionsLoading || budgetsLoading || summaryLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Financial Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Track your expenses, monitor budgets, and achieve your financial goals
          </p>
        </div>
        
        {/* Period Selector */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mt-4 sm:mt-0">
          {[
            { value: '7d', label: 'Week' },
            { value: '30d', label: 'Month' },
            { value: '90d', label: '3M' },
            { value: '1y', label: 'Year' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelectedPeriod(value)}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all duration-200 ${
                selectedPeriod === value
                  ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats summary={financialMetrics} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          <SpendingChart transactions={transactions} period={selectedPeriod} />
          <MonthlyOverview transactions={transactions} budgets={budgets} />
          <CategoryBreakdown transactions={transactions} />
        </div>

        {/* Right Column - Actions & Widgets */}
        <div className="space-y-6">
          <QuickActions />
          <BudgetProgress budgets={budgets} showViewAll={true} />
          <RecentTransactions transactions={transactions.slice(0, 5)} />
          <FinancialGoals goals={[]} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SmartInsights transactions={transactions} />
        <UpcomingBills />
      </div>
    </div>
  )
}

// Smart Insights Component
function SmartInsights({ transactions }) {
  const insights = useMemo(() => {
    const categorySpending = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
        return acc
      }, {})

    const topCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)[0]

    const totalExpenses = Object.values(categorySpending).reduce((sum, val) => sum + val, 0)
    const avgDailySpending = totalExpenses / 30

    return [
      {
        type: 'spending',
        title: 'Top Spending Category',
        description: `You spent most on ${topCategory?.[0] || 'N/A'} this month`,
        value: topCategory ? `₹${topCategory[1].toFixed(0)}` : '₹0',
        icon: '📊',
        action: 'Review Budget'
      },
      {
        type: 'trend',
        title: 'Daily Average',
        description: 'Your average daily spending',
        value: `₹${avgDailySpending.toFixed(0)}`,
        icon: '📈',
        action: 'Set Limit'
      },
      {
        type: 'goal',
        title: 'Savings Opportunity',
        description: 'Reduce dining out by 20% to save',
        value: '₹2,000/month',
        icon: '💡',
        action: 'Create Budget'
      }
    ]
  }, [transactions])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center mb-6">
        <BarChart3 className="w-5 h-5 mr-2 text-emerald-600" />
        Smart Insights
      </h3>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xl">{insight.icon}</span>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {insight.title}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {insight.description}
                </p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {insight.value}
                </p>
              </div>
              <button className="px-3 py-1.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
                {insight.action}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Upcoming Bills Component  
function UpcomingBills() {
  const { data: billsData, isLoading } = useGetBillRemindersQuery({ upcoming: true })
  const bills = billsData?.bills || []

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center mb-6">
          <Calendar className="w-5 h-5 mr-2 text-emerald-600" />
          Upcoming Bills
        </h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (bills.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center mb-6">
          <Calendar className="w-5 h-5 mr-2 text-emerald-600" />
          Upcoming Bills
        </h3>
        <EmptyState 
          icon={Calendar}
          title="No upcoming bills"
          message="Add bill reminders to never miss a payment"
          action={
            <Link 
              to="/bills/new"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200"
            >
              Add Bill Reminder
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center mb-6">
        <Calendar className="w-5 h-5 mr-2 text-emerald-600" />
        Upcoming Bills
      </h3>
      <div className="space-y-3">
        {bills.slice(0, 4).map((bill) => {
          const daysUntilDue = Math.ceil((new Date(bill.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
          const isOverdue = daysUntilDue < 0
          const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0
          
          return (
            <div key={bill._id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {bill.name}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  {(isOverdue || isDueSoon) && (
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  )}
                  <p className={`text-sm font-medium ${
                    isOverdue ? 'text-red-600 dark:text-red-400' :
                    isDueSoon ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {isOverdue 
                      ? `Overdue by ${Math.abs(daysUntilDue)} days`
                      : daysUntilDue === 0
                      ? 'Due today'
                      : `Due in ${daysUntilDue} days`
                    }
                  </p>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="font-bold text-gray-900 dark:text-white">
                  ₹{bill.amount.toFixed(0)}
                </p>
                <Badge 
                  variant={isOverdue ? 'error' : isDueSoon ? 'warning' : 'default'} 
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
      <Link 
        to="/bills"
        className="w-full mt-4 flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
      >
        View All Bills
      </Link>
    </div>
  )
}
