import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, TrendingDown, ArrowRightLeft, Receipt } from 'lucide-react'
import { format } from 'date-fns'
import Badge from '../ui/Badge'
import EmptyState from '../common/EmptyState'
import clsx from 'clsx'

const TransactionIcon = ({ type }) => {
  const icons = {
    income: TrendingUp,
    expense: TrendingDown,
    transfer: ArrowRightLeft,
  }
  
  const Icon = icons[type] || ArrowRightLeft
  
  const colorClasses = {
    income: 'bg-primary',
    expense: 'bg-gradient-to-br from-red-500 to-pink-600',
    transfer: 'bg-gradient-to-br from-blue-500 to-indigo-600',
  }
  
  return (
    <div className={clsx('p-2.5 rounded-xl shadow-md', colorClasses[type])}>
      <Icon className="w-5 h-5 text-white" />
    </div>
  )
}

export default function RecentTransactions({ transactions = [] }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount))
  }

  const getBadgeVariant = (type) => {
    const variants = {
      income: 'success',
      expense: 'error',
      transfer: 'primary',
    }
    return variants[type] || 'default'
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-surface-container/40 backdrop-blur-md rounded-3xl border border-outline-variant/30 p-6 transition-colors duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-on-surface flex items-center">
            <Receipt className="w-5 h-5 mr-2 text-secondary" />
            Recent Transactions
          </h3>
        </div>
        <EmptyState 
          icon={Receipt}
          title="No transactions yet"
          message="Start tracking your finances by adding your first transaction"
          action={
            <Link 
              to="/transactions?action=add"
              className="inline-flex items-center px-4 py-2 bg-primary text-on-primary font-semibold rounded-lg hover:brightness-110 transition-all duration-200"
            >
              Add Transaction
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="bg-surface-container/40 backdrop-blur-md rounded-3xl border border-outline-variant/30 p-6 transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-on-surface flex items-center">
            <Receipt className="w-5 h-5 mr-2 text-secondary" />
            Recent Transactions
          </h3>
          <p className="text-sm text-on-surface-variant mt-1">
            Last {Math.min(transactions.length, 5)} transactions
          </p>
        </div>
        <Link 
          to="/transactions" 
          className="text-sm text-secondary hover:brightness-110 font-semibold flex items-center group transition-colors duration-200"
        >
          View all
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
      
      {/* Transaction List */}
      <div className="space-y-3">
        {transactions.slice(0, 5).map((transaction, index) => (
          <div 
            key={transaction._id} 
            className="group flex items-center space-x-4 p-3 rounded-xl hover:bg-surface-container-high transition-all duration-200 animate-in slide-in-from-right"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <TransactionIcon type={transaction.type} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-on-surface truncate">
                  {transaction.description || transaction.category}
                </p>
                <span className={clsx(
                  'text-sm font-bold whitespace-nowrap ml-2',
                  transaction.type === 'income' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                )}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge variant={getBadgeVariant(transaction.type)} size="sm">
                  {transaction.category}
                </Badge>
                <p className="text-xs font-medium text-on-surface-variant">
                  {format(new Date(transaction.date), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-outline-variant/30">
        <Link 
          to="/transactions" 
          className="w-full flex items-center justify-center px-4 py-3 bg-surface-container-highest text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 group"
        >
          View All Transactions
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </div>
  )
}
