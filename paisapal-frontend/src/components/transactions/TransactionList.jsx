import React, { useState } from 'react'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { 
  Edit2, Trash2, 
  TrendingUp, TrendingDown, ArrowRightLeft,
  Calendar, Tag, MoreVertical, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useDeleteTransactionMutation } from '../../services/transactionApi'
import { toast } from 'react-hot-toast'
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
    return `${sign}₹${Math.abs(amount).toFixed(0)}`
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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 mt-1 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
            <TransactionIcon type={transaction.type} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {transaction.description || transaction.category}
              </h3>
              <div className="flex items-center space-x-2 ml-2">
                <span className={`text-base font-bold ${getTypeColor(transaction.type)} whitespace-nowrap`}>
                  {formatAmount(transaction.amount, transaction.type)}
                </span>
                
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                
                  {showMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-20 border border-gray-200 dark:border-gray-700 py-1">
                        <button
                          onClick={() => { onEdit(transaction); setShowMenu(false) }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => { onDelete(transaction); setShowMenu(false) }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
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
  )
}

export default function TransactionList({ transactions, onEdit, itemsPerPage = 10 }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState(null)

  const [deleteTransaction, { isLoading: isDeleting }] = useDeleteTransactionMutation()

  // Calculate pagination
  const totalItems = transactions?.length || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTransactions = transactions?.slice(startIndex, endIndex) || []

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return

    try {
      await deleteTransaction(transactionToDelete._id).unwrap()
      toast.success('Transaction deleted successfully', { icon: '🗑️' })
      setShowDeleteModal(false)
      setTransactionToDelete(null)
      
      // If current page becomes empty after deletion, go to previous page
      if (currentTransactions.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    } catch (error) {
      toast.error('Failed to delete transaction')
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState
        icon={TrendingDown}
        title="No transactions found"
        message="Try adjusting your filters to see more transactions"
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Transaction Cards */}
      <div className="space-y-3">
        {currentTransactions.map((transaction, index) => (
          <div
            key={transaction._id}
            className="animate-in slide-in-from-bottom duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <TransactionCard
              transaction={transaction}
              onEdit={onEdit}
              onDelete={handleDeleteClick}
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{startIndex + 1}</span> to{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{Math.min(endIndex, totalItems)}</span> of{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{totalItems}</span> transactions
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            <div className="flex items-center space-x-1">
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1
                // Show only nearby pages (current, prev, next, first, last)
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                          : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  )
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2 text-gray-400">...</span>
                }
                return null
              })}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Transaction" size="sm">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this transaction? This action cannot be undone.
          </p>
          {transactionToDelete && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-white dark:bg-gray-800">
                  <TransactionIcon type={transactionToDelete.type} className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {transactionToDelete.description || transactionToDelete.category}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ₹{transactionToDelete.amount.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
