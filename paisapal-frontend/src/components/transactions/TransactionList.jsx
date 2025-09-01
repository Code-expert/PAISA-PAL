import React, { useState, useMemo } from 'react'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { 
  Search, Filter, Download, Edit2, Trash2, 
  TrendingUp, TrendingDown, ArrowRightLeft,
  Calendar, DollarSign, Tag, MoreVertical
} from 'lucide-react'
import { useGetTransactionsQuery, useDeleteTransactionMutation } from '../../services/transactionApi'
import { toast } from 'react-hot-toast'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Modal from '../ui/Modal'
import LoadingSpinner from '../common/LoadingSpinner'
import EmptyState from '../common/EmptyState'

const TRANSACTION_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'expense', label: 'Expenses' },
  { value: 'income', label: 'Income' },
  { value: 'transfer', label: 'Transfers' }
]

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'food', label: '🍽️ Food & Dining' },
  { value: 'transportation', label: '🚗 Transportation' },
  { value: 'shopping', label: '🛍️ Shopping' },
  { value: 'entertainment', label: '🎬 Entertainment' },
  { value: 'salary', label: '💼 Salary' },
  { value: 'freelance', label: '💻 Freelance' },
  { value: 'other', label: '📦 Other' }
]

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Date (Newest First)' },
  { value: 'date-asc', label: 'Date (Oldest First)' },
  { value: 'amount-desc', label: 'Amount (High to Low)' },
  { value: 'amount-asc', label: 'Amount (Low to High)' }
]

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
            {/* Transaction Icon */}
            <div className="flex-shrink-0 mt-1">
              <TransactionIcon type={transaction.type} />
            </div>

            {/* Transaction Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {transaction.description || transaction.category}
                </h3>
                <div className="flex items-center space-x-2 ml-2">
                  <span className={`text-sm font-semibold ${getTypeColor(transaction.type)}`}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </span>
                  
                  {/* Menu Button */}
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
                          onClick={() => {
                            onEdit(transaction)
                            setShowMenu(false)
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onDelete(transaction)
                            setShowMenu(false)
                          }}
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

              {/* Category and Date */}
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

              {/* Tags */}
              {transaction.tags && transaction.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {transaction.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" size="sm">
                      {tag}
                    </Badge>
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

export default function TransactionList({ onEdit }) {
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    sortBy: 'date-desc'
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState(null)
  const [page, setPage] = useState(1)
  const limit = 10

  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetTransactionsQuery({
    page,
    limit,
    type: filters.type || undefined,
    category: filters.category || undefined,
    search: filters.search || undefined,
    sortBy: filters.sortBy
  })

  const [deleteTransaction, { isLoading: isDeleting }] = useDeleteTransactionMutation()

  // Filter and sort transactions on the frontend
  const filteredTransactions = useMemo(() => {
    if (!data?.transactions) return []
    
    let filtered = [...data.transactions]
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(transaction => 
        transaction.description?.toLowerCase().includes(searchLower) ||
        transaction.category.toLowerCase().includes(searchLower) ||
        transaction.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }
    
    return filtered
  }, [data?.transactions, filters])

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return
    
    try {
      await deleteTransaction(transactionToDelete._id).unwrap()
      toast.success('Transaction deleted successfully')
      refetch()
    } catch (error) {
      toast.error('Failed to delete transaction')
    } finally {
      setShowDeleteModal(false)
      setTransactionToDelete(null)
    }
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info('Export functionality coming soon!')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading transactions..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Failed to load transactions. Please try again.</p>
        <Button onClick={refetch} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Search transactions..."
              leftIcon={<Search className="w-4 h-4" />}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            
            <Select
              options={TRANSACTION_TYPES}
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
              placeholder="Filter by type"
            />
            
            <Select
              options={CATEGORIES}
              value={filters.category}
              onChange={(value) => setFilters({ ...filters, category: value })}
              placeholder="Filter by category"
            />
            
            <Select
              options={SORT_OPTIONS}
              value={filters.sortBy}
              onChange={(value) => setFilters({ ...filters, sortBy: value })}
              placeholder="Sort by"
            />
          </div>
          
          <div className="flex justify-end mt-4">
            <Button
              variant="secondary"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExport}
            >
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No transactions found"
          description={filters.search || filters.type || filters.category
            ? "Try adjusting your filters to see more transactions."
            : "Start tracking your finances by adding your first transaction."
          }
          actionLabel="Add Transaction"
          onAction={() => {/* TODO: Handle add transaction */}}
        />
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction._id}
              transaction={transaction}
              onEdit={onEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          
          <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {data.pagination.totalPages}
          </span>
          
          <Button
            variant="secondary"
            size="sm"
            disabled={page === data.pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Transaction"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this transaction? This action cannot be undone.
          </p>
          
          {transactionToDelete && (
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <TransactionIcon type={transactionToDelete.type} className="w-4 h-4" />
                <span className="font-medium">{transactionToDelete.description || transactionToDelete.category}</span>
                <span className="text-gray-500">•</span>
                <span>${transactionToDelete.amount}</span>
              </div>
            </div>
          )}
          
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={isDeleting}
              onClick={handleDeleteConfirm}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
