import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Target, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import Progress from '../ui/Progress'
import Badge from '../ui/Badge'
import EmptyState from '../common/EmptyState'
import clsx from 'clsx'

const BudgetItem = ({ budget }) => {
  const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0
  const remaining = budget.amount - budget.spent
  const isOverBudget = percentage > 100
  const isNearLimit = percentage > 80 && percentage <= 100

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
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
    if (isOverBudget) return <AlertTriangle className="w-5 h-5 text-red-500" />
    if (isNearLimit) return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    return <CheckCircle className="w-5 h-5 text-secondary" />
  }

  const getStatusBadge = () => {
    if (isOverBudget) return <Badge variant="error" size="sm">Over Budget</Badge>
    if (isNearLimit) return <Badge variant="warning" size="sm">Near Limit</Badge>
    return <Badge variant="success" size="sm">On Track</Badge>
  }

  return (
    <div className="group p-4 bg-surface-container/40 backdrop-blur-md rounded-xl border border-outline-variant/30 hover:shadow-lg transition-all duration-200">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              {getStatusIcon()}
            </div>
            <div>
              <h4 className="font-semibold text-on-surface">
                {budget.category || budget.name}
              </h4>
              <p className="text-xs text-on-surface-variant">
                {percentage.toFixed(0)}% used
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
        
        {/* Progress Bar */}
        <Progress 
          value={Math.min(percentage, 100)}
          variant={getProgressVariant()}
          size="md"
          className="my-3"
        />
        
        {/* Amount Details */}
        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="text-on-surface font-semibold">
              {formatCurrency(budget.spent || budget.actual)}
            </span>
            <span className="text-on-surface-variant"> of </span>
            <span className="text-on-surface-variant">
              {formatCurrency(budget.amount)}
            </span>
          </div>
          <div className={clsx(
            'font-semibold flex items-center space-x-1',
            isOverBudget 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-secondary'
          )}>
            {isOverBudget ? (
              <>
                <span>₹{Math.abs(remaining).toFixed(0)} over</span>
              </>
            ) : (
              <>
                <span>₹{remaining.toFixed(0)} left</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BudgetProgress({ budgets, showViewAll = true }) {
  if (!budgets || budgets.length === 0) {
    return (
      <EmptyState 
        icon={Target}
        title="No budgets yet"
        message="Create your first budget to start tracking your spending goals"
        action={
          <Link 
            to="/budgets/new"
            className="inline-flex items-center px-4 py-2 bg-primary text-on-primary font-semibold rounded-lg hover:brightness-110 transition-all duration-200"
          >
            Create Budget
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        }
      />
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Header */}
      {showViewAll && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-on-surface flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-secondary" />
            Budget Progress
          </h3>
          <Link 
            to="/budgets"
            className="text-sm font-semibold text-secondary hover:brightness-110 flex items-center transition-colors duration-200"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      )}

      {/* Budget Items */}
      <div className="space-y-3">
        {budgets.map(budget => (
          <BudgetItem key={budget._id || budget.id} budget={budget} />
        ))}
      </div>
    </div>
  )
}
