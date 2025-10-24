import React, { useState, useMemo } from 'react'
import { Calendar, TrendingUp, TrendingDown, Wallet, BarChart3, Download, Award, Target } from 'lucide-react'
import { useGetTransactionsQuery } from '../services/transactionApi'
import { useGetBudgetsQuery } from '../services/budgetApi'
import SpendingChart from '../components/dashboard/SpendingChart'
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown'
import MonthlyOverview from '../components/dashboard/MonthlyOverview'
import { toast } from 'react-hot-toast'

const TIME_PERIODS = [
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 3 Months' },
  { value: '6m', label: 'Last 6 Months' },
  { value: '1y', label: 'Last Year' }
]

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  const { data: transactionsData, isLoading } = useGetTransactionsQuery({
    limit: 1000,
    sortBy: 'date-desc'
  })
  
  const { data: budgetsData } = useGetBudgetsQuery()
  
  const transactions = transactionsData?.transactions || []
  const budgets = budgetsData?.budgets || []

  const filteredTransactions = useMemo(() => {
    const now = new Date()
    let startDate = new Date()
    
    switch (selectedPeriod) {
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '6m':
        startDate.setMonth(now.getMonth() - 6)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }
    
    return transactions.filter(t => new Date(t.date) >= startDate)
  }, [transactions, selectedPeriod])

  const analytics = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
    const categories = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
        return acc
      }, {})

    const topCategory = Object.entries(categories)
      .sort(([,a], [,b]) => b - a)[0]

    const avgDailySpending = expenses / (filteredTransactions.length > 0 ? 
      Math.max(1, (new Date() - new Date(Math.min(...filteredTransactions.map(t => new Date(t.date))))) / (1000 * 60 * 60 * 24)) : 1)

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netIncome: income - expenses,
      savingsRate: income > 0 ? ((income - expenses) / income * 100) : 0,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      avgDailySpending,
      transactionCount: filteredTransactions.length
    }
  }, [filteredTransactions])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      toast.error('No transactions to export')
      return
    }

    const csvData = filteredTransactions.map(t => ({
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Financial Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Detailed insights into your financial patterns and trends
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          >
            {TIME_PERIODS.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Total Income
          </h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(analytics.totalIncome)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Total Expenses
          </h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(analytics.totalExpenses)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Net Income
          </h3>
          <p className={`text-2xl font-bold ${analytics.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(analytics.netIncome)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Savings Rate
          </h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {analytics.savingsRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart 
          transactions={filteredTransactions}
          period={selectedPeriod}
        />
        
        <CategoryBreakdown 
          transactions={filteredTransactions}
        />
      </div>

      {/* Monthly Overview */}
      <MonthlyOverview 
        transactions={filteredTransactions}
        budgets={budgets}
      />

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Spending Insights
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                🏆 Top Spending Category
              </h4>
              <p className="text-blue-700 dark:text-blue-400">
                {analytics.topCategory 
                  ? `${analytics.topCategory.name}: ${formatCurrency(analytics.topCategory.amount)}`
                  : 'No expenses recorded'
                }
              </p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                📅 Daily Average Spending
              </h4>
              <p className="text-green-700 dark:text-green-400">
                {formatCurrency(analytics.avgDailySpending)} per day
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                📊 Transaction Count
              </h4>
              <p className="text-purple-700 dark:text-purple-400">
                {analytics.transactionCount} transactions in {TIME_PERIODS.find(p => p.value === selectedPeriod)?.label.toLowerCase()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            Financial Health Score
          </h3>
          
          <div className="space-y-6">
            <div className="text-center">
              <div className={`text-7xl font-bold mb-2 ${
                analytics.savingsRate >= 20 ? 'text-green-500' :
                analytics.savingsRate >= 10 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {analytics.savingsRate >= 20 ? 'A' :
                 analytics.savingsRate >= 10 ? 'B' : 'C'}
              </div>
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                {analytics.savingsRate >= 20 ? '🎉 Excellent' :
                 analytics.savingsRate >= 10 ? '👍 Good' : '💡 Needs Improvement'}
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-700 dark:text-gray-300">
                  Savings Rate: {analytics.savingsRate.toFixed(1)}%
                </span>
                <span className={analytics.savingsRate >= 20 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  Target: 20%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    analytics.savingsRate >= 20 ? 'bg-green-500' :
                    analytics.savingsRate >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(analytics.savingsRate, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {analytics.savingsRate >= 20 
                  ? '🎉 Great job! You\'re saving well above the recommended 20%.'
                  : analytics.savingsRate >= 10
                    ? '👍 You\'re on the right track. Try to increase your savings rate to 20%.'
                    : '💡 Focus on reducing expenses or increasing income to improve your savings rate.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
