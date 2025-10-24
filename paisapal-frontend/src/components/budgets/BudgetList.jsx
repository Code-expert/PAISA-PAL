import React, { useState } from 'react'
import { 
  Target, Edit2, Trash2, AlertTriangle, CheckCircle, 
  Plus, MoreVertical, Filter, TrendingUp
} from 'lucide-react'
import { useGetBudgetsQuery, useDeleteBudgetMutation } from '../../services/budgetApi'
import { toast } from 'react-hot-toast'
import Modal from '../ui/Modal'
import LoadingSpinner from '../common/LoadingSpinner'
import EmptyState from '../common/EmptyState'
import Badge from '../ui/Badge'

function BudgetCard({ budget, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false)
  
  const spent = budget.actual ?? 0  
  const amount = budget.amount ?? 0
  const alertThreshold = budget.alertThreshold ?? 80
  
  const percentage = amount > 0 ? (spent / amount) * 100 : 0
  const remaining = amount - spent
  const isOverBudget = percentage > 100
  const isNearLimit = percentage >= alertThreshold && percentage < 100

  const getStatusColor = () => {
    if (isOverBudget) return 'bg-red-500'
    if (isNearLimit) return 'bg-amber-500'
    return 'bg-green-500'
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600`}>
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {budget.name || budget.category}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {budget.period} budget
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={isOverBudget ? 'error' : isNearLimit ? 'warning' : 'success'}>
            {Math.round(percentage)}%
          </Badge>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
            
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-20 border border-gray-200 dark:border-gray-700 py-1">
                  <button
                    onClick={() => { onEdit(budget); setShowMenu(false) }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => { onDelete(budget); setShowMenu(false) }}
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

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full transition-all duration-300 ${getStatusColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {formatCurrency(spent)} spent
          </span>
          <span className="text-gray-900 dark:text-white font-semibold">
            {formatCurrency(amount)} budget
          </span>
        </div>
      </div>

      {/* Status Message */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isOverBudget ? (
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
          ) : isNearLimit ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          ) : (
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          )}
          <span className={`text-sm font-semibold ${
            isOverBudget ? 'text-red-600 dark:text-red-400' : 
            isNearLimit ? 'text-amber-600 dark:text-amber-400' : 
            'text-green-600 dark:text-green-400'
          }`}>
            {isOverBudget 
              ? `${formatCurrency(Math.abs(remaining))} over budget`
              : `${formatCurrency(remaining)} remaining`
            }
          </span>
        </div>
        
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Alert at {alertThreshold}%
        </span>
      </div>

      {/* Description */}
      {budget.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {budget.description}
        </p>
      )}
    </div>
  )
}

export default function BudgetList({ onEdit, onCreate }) {
  const [filters, setFilters] = useState({ period: '', status: '' })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [budgetToDelete, setBudgetToDelete] = useState(null)

  const { data: budgetsData, isLoading, error, refetch } = useGetBudgetsQuery()
  const [deleteBudget, { isLoading: isDeleting }] = useDeleteBudgetMutation()

  const budgets = budgetsData?.budgets || []

  // Filter budgets
  const filteredBudgets = budgets.filter(budget => {
    if (filters.period && budget.period !== filters.period) return false
    
    if (filters.status) {
      const percentage = budget.amount > 0 ? (budget.actual / budget.amount) * 100 : 0
      
      if (filters.status === 'over' && percentage <= 100) return false
      if (filters.status === 'warning' && (percentage < budget.alertThreshold || percentage > 100)) return false
      if (filters.status === 'good' && percentage >= budget.alertThreshold) return false
    }
    
    return true
  })

  const handleDeleteClick = (budget) => {
    setBudgetToDelete(budget)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!budgetToDelete) return
    
    try {
      await deleteBudget(budgetToDelete._id).unwrap()
      toast.success('Budget deleted successfully', { icon: '🗑️' })
      refetch()
    } catch (error) {
      toast.error('Failed to delete budget')
    } finally {
      setShowDeleteModal(false)
      setBudgetToDelete(null)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading budgets..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400 mb-4">Failed to load budgets. Please try again.</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
   
      {/* Filters */}
      {budgets.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filters.period}
                onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Periods</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="relative flex-1">
              <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Status</option>
                <option value="good">On Track</option>
                <option value="warning">Near Limit</option>
                <option value="over">Over Budget</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Budget Summary Stats */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Total Budgets
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {budgets.length}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              On Track
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {budgets.filter(b => (b.actual / b.amount * 100) < b.alertThreshold).length}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Over Budget
            </h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {budgets.filter(b => (b.actual / b.amount * 100) > 100).length}
            </p>
          </div>
        </div>
      )}

      {/* Budget List */}
      {filteredBudgets.length === 0 ? (
        <EmptyState
          icon={Target}
          title={budgets.length === 0 ? "No budgets created" : "No budgets match your filters"}
          message={budgets.length === 0 
            ? "Create your first budget to start tracking your spending and stay on top of your finances."
            : "Try adjusting your filters to see more budgets."
          }
          action={
            budgets.length === 0 && (
              <button
                onClick={onCreate}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Budget
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBudgets.map((budget, index) => (
            <div
              key={budget._id}
              className="animate-in slide-in-from-bottom duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <BudgetCard
                budget={budget}
                onEdit={onEdit}
                onDelete={handleDeleteClick}
              />
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Budget" size="sm">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this budget? This action cannot be undone.
          </p>
          
          {budgetToDelete && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {budgetToDelete.name || budgetToDelete.category}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(budgetToDelete.amount)}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
