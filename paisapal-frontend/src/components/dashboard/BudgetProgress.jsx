import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Target, AlertTriangle, CheckCircle } from 'lucide-react'
import Card from '../ui/Card'
import Progress from '../ui/Progress'
import Badge from '../ui/Badge'
import clsx from 'clsx'

const BudgetItem = ({ budget }) => {
  const percentage = budget.amount > 0 ? (budget.actual / budget.amount) * 100 : 0
  const remaining = budget.amount - budget.actual
  const isOverBudget = percentage > 100
  const isNearLimit = percentage > 80 && percentage <= 100

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount))
  }

  const getProgressVariant = () => {
    if (isOverBudget) return 'error'
    if (isNearLimit) return 'warning'
    return 'primary'
  }

  const getStatusIcon = () => {
    if (isOverBudget) return <AlertTriangle className="w-4 h-4 text-red-500" />
    if (isNearLimit) return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    return <CheckCircle className="w-4 h-4 text-green-500" />
  }

  const getStatusBadge = () => {
    if (isOverBudget) return <Badge variant="error" size="sm">Over Budget</Badge>
    if (isNearLimit) return <Badge variant="warning" size="sm">Near Limit</Badge>
    return <Badge variant="success" size="sm">On Track</Badge>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="font-medium text-gray-900 dark:text-white">
            {budget.category}
          </span>
        </div>
        {getStatusBadge()}
      </div>
      
      <Progress 
        value={Math.min(percentage, 100)}
        variant={getProgressVariant()}
        size="md"
      />
      
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {formatCurrency(budget.actual)} of {formatCurrency(budget.amount)}
        </span>
        <span className={clsx(
          'font-medium',
          isOverBudget 
            ? 'text-red-600 dark:text-red-400' 
            : 'text-gray-600 dark:text-gray-400'
        )}>
          {isOverBudget 
            ? `${formatCurrency(Math.abs(remaining))} over` 
            : `${formatCurrency(remaining)} left`
          }
        </span>
      </div>
    </div>
  )
}

export default function BudgetProgress({ budgets = [] }) {
  if (!budgets || budgets.length === 0) {
    return (
      <Card>
        <Card.Header>
          <Card.Title>Budget Overview</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="text-center py-8">
            <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No budgets set
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create budgets to track your spending and reach your financial goals.
            </p>
            <Link to="/budgets" className="btn-primary">
              Create Budget
            </Link>
          </div>
        </Card.Content>
      </Card>
    )
  }

  // Calculate overall budget health
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.actual, 0)
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  
  const overBudgetCount = budgets.filter(b => (b.actual / b.amount) * 100 > 100).length
  const nearLimitCount = budgets.filter(b => {
    const pct = (b.actual / b.amount) * 100
    return pct > 80 && pct <= 100
  }).length

  return (
    <Card>
      <Card.Header>
        <Card.Title>Budget Overview</Card.Title>
        <Link 
          to="/budgets" 
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
        >
          Manage budgets
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </Card.Header>
      
      <Card.Content>
        {/* Overall Progress */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Overall Budget
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {overallPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={Math.min(overallPercentage, 100)}
            variant={overallPercentage > 100 ? 'error' : overallPercentage > 80 ? 'warning' : 'primary'}
            size="lg"
          />
          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
              }).format(totalSpent)} spent
            </span>
            <span>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
              }).format(totalBudget)} budgeted
            </span>
          </div>
        </div>

        {/* Budget Alerts */}
        {(overBudgetCount > 0 || nearLimitCount > 0) && (
          <div className="mb-6 space-y-2">
            {overBudgetCount > 0 && (
              <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span>{overBudgetCount} budget{overBudgetCount > 1 ? 's' : ''} over limit</span>
              </div>
            )}
            {nearLimitCount > 0 && (
              <div className="flex items-center space-x-2 text-sm text-yellow-600 dark:text-yellow-400">
                <AlertTriangle className="w-4 h-4" />
                <span>{nearLimitCount} budget{nearLimitCount > 1 ? 's' : ''} near limit</span>
              </div>
            )}
          </div>
        )}

        {/* Individual Budgets */}
        <div className="space-y-6">
          {budgets.slice(0, 4).map((budget) => (
            <BudgetItem key={budget._id} budget={budget} />
          ))}
        </div>
      </Card.Content>
      
      {budgets.length > 4 && (
        <Card.Footer>
          <Link 
            to="/budgets" 
            className="btn-secondary w-full"
          >
            View All Budgets ({budgets.length})
          </Link>
        </Card.Footer>
      )}
    </Card>
  )
}
