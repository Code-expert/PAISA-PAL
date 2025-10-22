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

  export default function BudgetProgress({ budgets }) {
    // ✅ Make sure budgets prop is being passed correctly
    console.log('Budgets in BudgetProgress:', budgets)
    
    if (!budgets || budgets.length === 0) {
      return <EmptyState message="No budgets set" />
    }
    
    return (
      <div className="space-y-4">
        {budgets.map(budget => (
          <div key={budget._id}>
            <div className="flex justify-between mb-2">
              <span>{budget.name}</span>
              <span>${budget.spent} / ${budget.amount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${budget.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

