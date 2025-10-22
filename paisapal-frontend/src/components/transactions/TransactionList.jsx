import React, { useState } from 'react'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { 
  Edit2, Trash2, 
  TrendingUp, TrendingDown, ArrowRightLeft,
  Calendar, DollarSign, Tag, MoreVertical
} from 'lucide-react'
import { useDeleteTransactionMutation } from '../../services/transactionApi'
import { toast } from 'react-hot-toast'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Modal from '../ui/Modal'
import EmptyState from '../common/EmptyState'

function TransactionIcon({ type, className = "w-5 h-5" }) {
  const icons = {
    income: TrendingUp,
    expense: TrendingDown,
    transfer: ArrowRightLeft
  }
  
  const Icon = icons[type] || TrendingDown
  const colorClass = {
    income: 'text-green-600 dark:text-green-400',
    expense: 'text-red-600 dark:text-red-400',
    transfer: 'text-blue-600 dark:text-blue-400'
  }
  
  return <Icon className={`${className} ${colorClass[type]}`} />
}

function TransactionCard({ transaction, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false)
  
  const formatDate = (dateString) => {
    const date = parseISO(dateString)
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'MMM dd, yyyy')
  }

  const formatAmount = (amount, type) => {
    const sign = type === 'income' ? '+' : type === 'expense' ? '-' : ''
    return `${sign}$${Math.abs(amount).toFixed(2)}`
  }

  const getTypeColor = (type) => {
    const colors = {
      income: 'text-green-600 dark:text-green-400',
      expense: 'text-red-600 dark:text-red-400',
      transfer: 'text-blue-600 dark:text-blue-400'
    }
    return colors[type] || colors.expense
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0 mt-1">
              <TransactionIcon type={transaction.type} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {transaction.description || transaction.category}
                </h3>
                <div className="flex items-center space-x-2 ml-2">
                  <span className={`text-sm font-semibold ${getTypeColor(transaction.type)}`}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </span>
                  
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-1"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  
                    {showMenu && (
                      <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => { onEdit(transaction); setShowMenu(false) }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => { onDelete(transaction); setShowMenu(false) }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Tag className="w-3 h-3" />
                  <span>{transaction.category}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(transaction.date)}</span>
                </div>
              </div>

              {transaction.tags && transaction.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {transaction.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" size="sm">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function TransactionList({ transactions, onEdit }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState(null)

  const [deleteTransaction, { isLoading: isDeleting }] = useDeleteTransactionMutation()

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return

    try {
      await deleteTransaction(transactionToDelete._id).unwrap()
      toast.success('Transaction deleted successfully')
      setShowDeleteModal(false)
      setTransactionToDelete(null)
    } catch (error) {
      toast.error('Failed to delete transaction')
    }
  }

  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState
        icon={DollarSign}
        title="No transactions found"
        description="Try adjusting your filters to see more transactions."
      />
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map(transaction => (
        <TransactionCard
          key={transaction._id}
          transaction={transaction}
          onEdit={onEdit}
          onDelete={handleDeleteClick}
        />
      ))}

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Transaction">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this transaction? This action cannot be undone.
          </p>
          {transactionToDelete && (
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <TransactionIcon type={transactionToDelete.type} className="w-4 h-4" />
                <span className="font-medium">{transactionToDelete.description || transactionToDelete.category}</span>
                <span className="text-gray-500">&bull;</span>
                <span>${transactionToDelete.amount}</span>
              </div>
            </div>
          )}
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="danger" loading={isDeleting} onClick={handleDeleteConfirm} className="flex-1">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
