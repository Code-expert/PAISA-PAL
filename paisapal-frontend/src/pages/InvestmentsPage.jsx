import React, { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Plus, BarChart3, PieChart, RefreshCw } from 'lucide-react'
import { useGetInvestmentsQuery, useCreateInvestmentMutation } from '../services/investmentApi'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import InvestmentForm from '../components/investments/InvestmentForm'
import InvestmentList from '../components/investments/InvestmentList'
import PortfolioChart from '../components/investments/PortfolioChart'
import PerformanceChart from '../components/investments/PerformanceChart'

export default function InvestmentsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState(null)
  const [viewMode, setViewMode] = useState('portfolio') // 'portfolio', 'list', 'performance'

  const { data: investmentsData, isLoading, refetch } = useGetInvestmentsQuery()
  const investments = investmentsData?.investments || []

  // Calculate portfolio metrics
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
            Investment Portfolio
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage your investment portfolio
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Button
            variant={viewMode === 'portfolio' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('portfolio')}
            leftIcon={<PieChart className="w-4 h-4" />}
          >
            Portfolio
          </Button>
          <Button
            variant={viewMode === 'performance' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('performance')}
            leftIcon={<BarChart3 className="w-4 h-4" />}
          >
            Performance
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={refetch}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Investment
          </Button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6 text-center">
            <DollarSign className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Total Value
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              ${portfolioMetrics.totalValue.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Total Cost
            </h3>
            <p className="text-2xl font-bold text-gray-600">
              ${portfolioMetrics.totalCost.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6 text-center">
            {portfolioMetrics.totalGain >= 0 ? (
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-500 mx-auto mb-2" />
            )}
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Total Gain/Loss
            </h3>
            <p className={`text-2xl font-bold ${portfolioMetrics.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioMetrics.totalGain >= 0 ? '+' : ''}${portfolioMetrics.totalGain.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6 text-center">
            <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Return %
            </h3>
            <p className={`text-2xl font-bold ${portfolioMetrics.gainPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioMetrics.gainPercentage >= 0 ? '+' : ''}{portfolioMetrics.gainPercentage.toFixed(2)}%
            </p>
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      {viewMode === 'portfolio' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PortfolioChart investments={investments} />
          
          <Card>
            <Card.Header>
              <Card.Title>Portfolio Insights</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                    Top Performer
                  </h4>
                  <p className="text-blue-700 dark:text-blue-400">
                    {portfolioMetrics.topPerformer 
                      ? `${portfolioMetrics.topPerformer.symbol}: ${(((portfolioMetrics.topPerformer.currentPrice - portfolioMetrics.topPerformer.purchasePrice) / portfolioMetrics.topPerformer.purchasePrice) * 100).toFixed(2)}%`
                      : 'No investments yet'
                    }
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">
                    Portfolio Diversity
                  </h4>
                  <p className="text-green-700 dark:text-green-400">
                    {portfolioMetrics.investmentCount} different investments
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2">
                    Portfolio Health
                  </h4>
                  <Badge variant={portfolioMetrics.gainPercentage >= 5 ? 'success' : portfolioMetrics.gainPercentage >= 0 ? 'warning' : 'error'}>
                    {portfolioMetrics.gainPercentage >= 5 ? 'Strong Performance' :
                     portfolioMetrics.gainPercentage >= 0 ? 'Stable' : 'Needs Attention'}
                  </Badge>
                </div>
              </div>
            </Card.Content>
          </Card>
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
