import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react'
import { format } from 'date-fns'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import clsx from 'clsx'

const TransactionIcon = ({ type }) => {
  const icons = {
    income: TrendingUp,
    expense: TrendingDown,
    transfer: ArrowRightLeft,
  }
  
  const Icon = icons[type] || ArrowRightLeft
  
  const colorClasses = {
    income: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    expense: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
    transfer: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  }
  
  return (
    <div className={clsx('p-2 rounded-full', colorClasses[type])}>
      <Icon className="w-4 h-4" />
    </div>
  )
}

export default function RecentTransactions({ transactions = [] }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Math.abs(amount))
  }

  const getBadgeVariant = (type) => {
    const variants = {
      income: 'success',
      expense: 'error',
      transfer: 'info',
    }
    return variants[type] || 'default'
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <Card.Header>
          <Card.Title>Recent Transactions</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No transactions yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Start tracking your finances by adding your first transaction.
            </p>
            <Link to="/transactions" className="btn-primary">
              Add Transaction
            </Link>
          </div>
        </Card.Content>
      </Card>
    )
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Recent Transactions</Card.Title>
        <Link 
          to="/transactions" 
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
        >
          View all
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </Card.Header>
      
      <Card.Content>
        <div className="space-y-4">
          {transactions.slice(0, 5).map((transaction) => (
            <div key={transaction._id} className="flex items-center space-x-4">
              <TransactionIcon type={transaction.type} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {transaction.description || transaction.category}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className={clsx(
                      'text-sm font-semibold',
                      transaction.type === 'income' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-900 dark:text-white'
                    )}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getBadgeVariant(transaction.type)} size="sm">
                      {transaction.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(transaction.date), 'MMM dd')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card.Content>
      
      <Card.Footer>
        <Link 
          to="/transactions" 
          className="btn-secondary w-full"
        >
          View All Transactions
        </Link>
      </Card.Footer>
    </Card>
  )
}
