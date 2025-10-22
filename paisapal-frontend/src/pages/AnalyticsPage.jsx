import React, { useState, useMemo } from 'react'
import { Calendar, TrendingUp, DollarSign, BarChart3, Download, Filter } from 'lucide-react'
import { useGetTransactionsQuery } from '../services/transactionApi'
import { useGetBudgetsQuery } from '../services/budgetApi'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import SpendingChart from '../components/dashboard/SpendingChart'
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown'
import MonthlyOverview from '../components/dashboard/MonthlyOverview'

const TIME_PERIODS = [
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 3 Months' },
  { value: '6m', label: 'Last 6 Months' },
  { value: '1y', label: 'Last Year' }
]

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const { data: transactionsData, isLoading } = useGetTransactionsQuery({
    limit: 1000, // Get more data for analytics
    sortBy: 'date-desc'
  })
  
  const { data: budgetsData } = useGetBudgetsQuery()
  
  const transactions = transactionsData?.transactions || []
  const budgets = budgetsData?.budgets || []

  // Filter transactions by selected period
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

  // Calculate key metrics
  const analytics = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const categories = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
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

  const handleExport = () => {
    // Create CSV data
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
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Financial Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Detailed insights into your financial patterns and trends
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)} 
            options={TIME_PERIODS}
            className="w-40"
          />
          <Button
            variant="secondary"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Total Income
            </h3>
            <p className="text-2xl font-bold text-green-600">
              ${analytics.totalIncome.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-red-500 mx-auto mb-2 rotate-180" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Total Expenses
            </h3>
            <p className="text-2xl font-bold text-red-600">
              ${analytics.totalExpenses.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6 text-center">
            <DollarSign className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Net Income
            </h3>
            <p className={`text-2xl font-bold ${analytics.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${analytics.netIncome.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6 text-center">
            <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Savings Rate
            </h3>
            <p className="text-2xl font-bold text-purple-600">
              {analytics.savingsRate.toFixed(1)}%
            </p>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <Card.Header>
            <Card.Title>Spending Insights</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                  Top Spending Category
                </h4>
                <p className="text-blue-700 dark:text-blue-400">
                  {analytics.topCategory 
                    ? `${analytics.topCategory.name}: $${analytics.topCategory.amount.toFixed(2)}`
                    : 'No expenses recorded'
                  }
                </p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">
                  Daily Average Spending
                </h4>
                <p className="text-green-700 dark:text-green-400">
                  ${analytics.avgDailySpending.toFixed(2)} per day
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2">
                  Transaction Count
                </h4>
                <p className="text-purple-700 dark:text-purple-400">
                  {analytics.transactionCount} transactions in {selectedPeriod.replace('d', ' days').replace('m', ' months').replace('y', ' year')}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Financial Health Score</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-6xl font-bold mb-2 ${
                  analytics.savingsRate >= 20 ? 'text-green-500' :
                  analytics.savingsRate >= 10 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {analytics.savingsRate >= 20 ? 'A' :
                   analytics.savingsRate >= 10 ? 'B' : 'C'}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {analytics.savingsRate >= 20 ? 'Excellent' :
                   analytics.savingsRate >= 10 ? 'Good' : 'Needs Improvement'}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Savings Rate: {analytics.savingsRate.toFixed(1)}%</span>
                  <span className={analytics.savingsRate >= 20 ? 'text-green-600' : 'text-red-600'}>
                    Target: 20%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      analytics.savingsRate >= 20 ? 'bg-green-500' :
                      analytics.savingsRate >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(analytics.savingsRate, 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {analytics.savingsRate >= 20 
                  ? '🎉 Great job! You\'re saving well above the recommended 20%.'
                  : analytics.savingsRate >= 10
                    ? '👍 You\'re on the right track. Try to increase your savings rate to 20%.'
                    : '💡 Focus on reducing expenses or increasing income to improve your savings rate.'
                }
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}
