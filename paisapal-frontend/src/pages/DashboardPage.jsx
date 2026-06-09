import React, { useState, useMemo } from 'react'
import { 
  TrendingUp, Calendar, BarChart3, Target,
  AlertCircle, Download, Award
} from 'lucide-react'
import { useGetTransactionsQuery } from '../services/transactionApi'
import { useGetBudgetsQuery } from '../services/budgetApi'
import { useGetFinancialSummaryQuery } from '../services/financialApi'
import { useGetBillRemindersQuery } from '../services/billReminderApi'
import { toast } from 'react-hot-toast'
import QuickStats from '../components/dashboard/QuickStats'
import RecentTransactions from '../components/dashboard/RecentTransactions'
import BudgetProgress from '../components/dashboard/BudgetProgress'
import SpendingChart from '../components/dashboard/SpendingChart'
import QuickActions from '../components/dashboard/QuickActions'
import MonthlyOverview from '../components/dashboard/MonthlyOverview'
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown'
import FinancialGoals from '../components/dashboard/FinancialGoals'
import FinancialSummary from '../components/dashboard/FinancialGoals' 
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

  const handleExport = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to export')
      return
    }

    const csvData = transactions.map(t => ({
      Date: new Date(t.date).toLocaleDateString(),
      Type: t.type,
      Category: t.category,
      Description: t.description || '',
      Amount: t.amount
    }))
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(csvData[0]).join(",") + "\n" +
      csvData.map(row => Object.values(row).join(",")).join("\n")
    
    const link = document.createElement("a")
    link.setAttribute("href", encodeURI(csvContent))
    link.setAttribute("download", `transactions_${selectedPeriod}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Transactions exported successfully', { icon: '📥' })
  }

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm sm:text-base">
            Track your expenses, monitor budgets, and achieve your financial goals
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 sm:mt-0">
          <div className="flex bg-surface-container rounded-lg p-1 shadow-sm border border-outline-variant/20">
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
                    ? 'bg-surface text-on-surface shadow-sm ring-1 ring-outline-variant/30'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleExport}
            className="flex items-center justify-center px-4 py-2 bg-surface-container-highest text-on-surface font-semibold rounded-lg hover:bg-outline-variant transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>
      

      {/* Quick Stats */}
      <QuickStats summary={financialMetrics} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Left Column - Charts & Transactions */}
        <div className="lg:col-span-2 space-y-8">
          <SpendingChart transactions={transactions} period={selectedPeriod} />
          <RecentTransactions transactions={transactions.slice(0, 5)} />
          <MonthlyOverview transactions={transactions} budgets={budgets} />
          <CategoryBreakdown transactions={transactions} />
        </div>

        {/* Right Column - Sidebar Widgets */}
        <div className="space-y-8">
          <FinancialHealthScore savingsRate={financialMetrics.savingsRate} />
          <UpcomingBills />
          <SmartInsights transactions={transactions} />
          <QuickActions />
          <BudgetProgress budgets={budgets} showViewAll={true} />
          <FinancialGoals goals={[]} />
        </div>
      </div>
    </div>
  )
}

// Financial Health Score Component
function FinancialHealthScore({ savingsRate }) {
  const isExcellent = savingsRate >= 20;
  const isGood = savingsRate >= 10 && savingsRate < 20;
  
  return (
    <div className="bg-surface-container/40 backdrop-blur-md rounded-3xl border border-outline-variant/30 p-6 shadow-xl transition-all duration-300">
      <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
        <Award className="w-5 h-5 text-secondary" />
        Financial Health
      </h3>
      
      <div className="space-y-6">
        <div className="text-center">
          <div className={`text-6xl font-extrabold mb-2 tracking-tighter ${
            isExcellent ? 'text-green-500' :
            isGood ? 'text-yellow-500' : 'text-error'
          }`}>
            {isExcellent ? 'A' : isGood ? 'B' : 'C'}
          </div>
          <p className="text-lg font-bold text-on-surface-variant">
            {isExcellent ? '🎉 Excellent' : isGood ? '👍 Good' : '💡 Needs Improvement'}
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-on-surface">
              Savings Rate: {savingsRate.toFixed(1)}%
            </span>
            <span className={isExcellent ? 'text-green-500' : 'text-error'}>
              Target: 20%
            </span>
          </div>
          <div className="w-full bg-outline-variant/50 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isExcellent ? 'bg-green-500' : isGood ? 'bg-yellow-500' : 'bg-error'
              }`}
              style={{ width: `${Math.min(savingsRate, 100)}%` }}
            />
          </div>
        </div>
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
    <div className="bg-gradient-to-br from-surface-container/80 to-surface-container-low/80 backdrop-blur-md p-6 rounded-3xl border border-outline-variant/20 shadow-xl transition-all duration-300">
      <h3 className="text-lg font-bold text-on-surface flex items-center mb-6">
        <BarChart3 className="w-5 h-5 mr-2 text-primary" />
        Smart Insights
      </h3>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="relative group cursor-pointer">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative p-4 bg-surface-container-high rounded-2xl border border-outline-variant/30">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xl">{insight.icon}</span>
                    <h4 className="font-semibold text-on-surface">
                      {insight.title}
                    </h4>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-2">
                    {insight.description}
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {insight.value}
                  </p>
                </div>
                <button className="px-3 py-1.5 text-xs font-semibold bg-surface-container-highest text-on-surface rounded-lg hover:bg-surface-variant transition-colors duration-200">
                  {insight.action}
                </button>
              </div>
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
      <div className="bg-surface-container/40 backdrop-blur-md rounded-3xl border border-outline-variant/20 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-on-surface flex items-center mb-6">
          <Calendar className="w-5 h-5 mr-2 text-primary" />
          Upcoming Bills
        </h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-surface-container-high rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (bills.length === 0) {
    return (
      <div className="bg-surface-container/40 backdrop-blur-md rounded-3xl border border-outline-variant/20 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-on-surface flex items-center mb-6">
          <Calendar className="w-5 h-5 mr-2 text-primary" />
          Upcoming Bills
        </h3>
        <EmptyState 
          icon={Calendar}
          title="No upcoming bills"
          message="Add bill reminders to never miss a payment"
          action={
            <Link 
              to="/bills/new"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary to-primary-container text-on-primary font-semibold rounded-lg hover:brightness-110 transition-all duration-200"
            >
              Add Bill Reminder
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="bg-surface-container/40 backdrop-blur-md rounded-3xl border border-outline-variant/20 p-6 shadow-xl transition-all duration-300">
      <h3 className="text-lg font-bold text-on-surface flex items-center mb-6">
        <Calendar className="w-5 h-5 mr-2 text-primary" />
        Upcoming Bills
      </h3>
      <div className="space-y-4">
        {bills.slice(0, 4).map((bill) => {
          const daysUntilDue = Math.ceil((new Date(bill.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
          const isOverdue = daysUntilDue < 0
          const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0
          
          return (
            <div key={bill._id} className="p-4 bg-surface-container rounded-2xl flex justify-between items-center group cursor-pointer hover:bg-surface-container-high transition-all">
              <div className="flex-1 flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-container-highest rounded-xl flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {bill.name}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    {(isOverdue || isDueSoon) && (
                      <AlertCircle className="w-3.5 h-3.5 text-error" />
                    )}
                    <p className={`text-[10px] font-label uppercase tracking-widest ${
                      isOverdue ? 'text-error' :
                      isDueSoon ? 'text-tertiary-container' :
                      'text-on-surface-variant'
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
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-on-surface">
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
        className="w-full mt-6 flex items-center justify-center py-3 rounded-xl border border-dashed border-outline-variant text-on-surface-variant text-sm font-medium hover:border-primary/50 hover:text-on-surface transition-all"
      >
        View All Bills
      </Link>
    </div>
  )
}
