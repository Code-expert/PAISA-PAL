import React, { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, Plus, BarChart3, PieChart, RefreshCw, Wallet, Target } from 'lucide-react'
import { useGetInvestmentsQuery } from '../services/investmentApi'
import Modal from '../components/ui/Modal'
import InvestmentForm from '../components/investments/InvestmentForm'
import InvestmentList from '../components/investments/InvestmentList'
import PortfolioChart from '../components/investments/PortfolioChart'
import PerformanceChart from '../components/investments/PerformanceChart'

export default function InvestmentsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState(null)
  const [viewMode, setViewMode] = useState('portfolio')

  const { data: investmentsData, isLoading, refetch } = useGetInvestmentsQuery()
  const investments = investmentsData?.investments || []

  const portfolioMetrics = useMemo(() => {
    const totalValue = investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0)
    const totalCost = investments.reduce((sum, inv) => sum + (inv.purchasePrice * inv.quantity), 0)
    const totalGain = totalValue - totalCost
    const gainPercentage = totalCost > 0 ? (totalGain / totalCost) * 100 : 0

    const topPerformer = investments.length > 0 
      ? investments.reduce((best, current) => {
          const currentGain = ((current.currentPrice - current.purchasePrice) / current.purchasePrice) * 100
          const bestGain = ((best.currentPrice - best.purchasePrice) / best.purchasePrice) * 100
          return currentGain > bestGain ? current : best
        })
      : null

    return {
      totalValue,
      totalCost,
      totalGain,
      gainPercentage,
      topPerformer,
      investmentCount: investments.length
    }
  }, [investments])

  const handleEdit = (investment) => {
    setEditingInvestment(investment)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingInvestment(null)
    refetch()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingInvestment(null)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Investment Portfolio
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Track and manage your investment portfolio
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setViewMode('portfolio')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
              viewMode === 'portfolio'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Portfolio
          </button>
          <button
            onClick={() => setViewMode('performance')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
              viewMode === 'performance'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Performance
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
              viewMode === 'list'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            List
          </button>
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold text-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Investment
          </button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Total Value
            </h3>
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(portfolioMetrics.totalValue)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <Target className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Total Cost
            </h3>
          </div>
          <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">
            {formatCurrency(portfolioMetrics.totalCost)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2.5 rounded-xl ${
              portfolioMetrics.totalGain >= 0 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              {portfolioMetrics.totalGain >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Total Gain/Loss
            </h3>
          </div>
          <p className={`text-3xl font-bold ${
            portfolioMetrics.totalGain >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {portfolioMetrics.totalGain >= 0 ? '+' : ''}{formatCurrency(portfolioMetrics.totalGain)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Return %
            </h3>
          </div>
          <p className={`text-3xl font-bold ${
            portfolioMetrics.gainPercentage >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {portfolioMetrics.gainPercentage >= 0 ? '+' : ''}{portfolioMetrics.gainPercentage.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'portfolio' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortfolioChart investments={investments} />
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Portfolio Insights
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Top Performer
                </h4>
                <p className="text-blue-700 dark:text-blue-400">
                  {portfolioMetrics.topPerformer 
                    ? `${portfolioMetrics.topPerformer.symbol}: ${(((portfolioMetrics.topPerformer.currentPrice - portfolioMetrics.topPerformer.purchasePrice) / portfolioMetrics.topPerformer.purchasePrice) * 100).toFixed(2)}%`
                    : 'No investments yet'
                  }
                </p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2 flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Portfolio Diversity
                </h4>
                <p className="text-green-700 dark:text-green-400">
                  {portfolioMetrics.investmentCount} different investments
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Portfolio Health
                </h4>
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${
                  portfolioMetrics.gainPercentage >= 5 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : portfolioMetrics.gainPercentage >= 0 
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>
                  {portfolioMetrics.gainPercentage >= 5 ? '🚀 Strong Performance' :
                   portfolioMetrics.gainPercentage >= 0 ? '📈 Stable' : '⚠️ Needs Attention'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'performance' && (
        <PerformanceChart investments={investments} />
      )}

      {viewMode === 'list' && (
        <InvestmentList 
          investments={investments}
          onEdit={handleEdit}
        />
      )}

      {/* Add/Edit Investment Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleFormCancel}
        title={editingInvestment ? 'Edit Investment' : 'Add Investment'}
        size="lg"
      >
        <InvestmentForm
          initialData={editingInvestment}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>
    </div>
  )
}
