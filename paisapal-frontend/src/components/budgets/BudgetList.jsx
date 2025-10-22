import React, { useState } from 'react'
import { format } from 'date-fns'
import { 
  Target, Edit2, Trash2, AlertTriangle, CheckCircle, 
  TrendingUp, Plus, MoreVertical, Filter
} from 'lucide-react'
import { useGetBudgetsQuery, useDeleteBudgetMutation } from '../../services/budgetApi'
import { toast } from 'react-hot-toast'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Progress from '../ui/Progress'
import Modal from '../ui/Modal'
import LoadingSpinner from '../common/LoadingSpinner'
import EmptyState from '../common/EmptyState'

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
    if (isOverBudget) return 'error'
    if (isNearLimit) return 'warning'
    return 'success'
  }

  const getStatusIcon = () => {
    if (isOverBudget) return <AlertTriangle className="w-4 h-4" />
    if (isNearLimit) return <AlertTriangle className="w-4 h-4" />
    return <CheckCircle className="w-4 h-4" />
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {budget.name || budget.category}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {budget.period} budget
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusColor()}>
              {Math.round(percentage)}%
            </Badge>
            
            {/* Menu button */}
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
                      onEdit(budget)
                      setShowMenu(false)
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete(budget)
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

        {/* Progress Bar */}
        <div className="mb-4">
          <Progress
            value={Math.min(percentage, 100)}
            variant={getStatusColor()}
            size="md"
            className="mb-2"
          />
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {/* ✅ Safe toFixed() calls with default values */}
              ${spent.toFixed(2)} spent
            </span>
            <span className="text-gray-900 dark:text-white font-medium">
              ${amount.toFixed(2)} budget
            </span>
          </div>
        </div>

        {/* Status Message */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`${
              isOverBudget ? 'text-red-600' : 
              isNearLimit ? 'text-amber-600' : 'text-green-600'
            }`}>
              {getStatusIcon()}
            </span>
            <span className={`text-sm font-medium ${
              isOverBudget ? 'text-red-600' : 
              isNearLimit ? 'text-amber-600' : 'text-green-600'
            }`}>
              {/* ✅ Safe calculation and toFixed() calls */}
              {isOverBudget 
                ? `$${Math.abs(remaining).toFixed(2)} over budget`
                : `$${remaining.toFixed(2)} remaining`
              }
            </span>
          </div>
          
          <span className="text-xs text-gray-500">
            Alert at {alertThreshold}%
          </span>
        </div>

        {/* Description */}
        {budget.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            {budget.description}
          </p>
        )}
      </div>
    </Card>
  )
}


export default function BudgetList({ onEdit, onCreate }) {
  const [filters, setFilters] = useState({
    period: '',
    status: ''
  })
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
      toast.success('Budget deleted successfully')
      refetch()
    } catch (error) {
      toast.error('Failed to delete budget')
    } finally {
      setShowDeleteModal(false)
      setBudgetToDelete(null)
    }
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
      <div className="text-center text-red-600 p-8">
        <p>Failed to load budgets. Please try again.</p>
        <Button onClick={refetch} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Budget Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your spending limits and track progress
          </p>
        </div>
        
        <Button
          onClick={onCreate}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Budget
        </Button>
      </div>

      {/* Filters */}
      {budgets.length > 0 && (
        <Card>
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <select
                value={filters.period}
                onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
              >
                <option value="">All Periods</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="good">On Track</option>
                <option value="warning">Near Limit</option>
                <option value="over">Over Budget</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Budget Summary Stats */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="p-6 text-center">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Total Budgets
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {budgets.length}
              </p>
            </div>
          </Card>
          
          <Card>
            <div className="p-6 text-center">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                On Track
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {budgets.filter(b => (b.actual / b.amount * 100) < b.alertThreshold).length}
              </p>
            </div>
          </Card>
          
          <Card>
            <div className="p-6 text-center">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Over Budget
              </h3>
              <p className="text-2xl font-bold text-red-600">
                {budgets.filter(b => (b.actual / b.amount * 100) > 100).length}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Budget List */}
      {filteredBudgets.length === 0 ? (
        <EmptyState
          icon={Target}
          title={budgets.length === 0 ? "No budgets created" : "No budgets match your filters"}
          description={budgets.length === 0 
            ? "Create your first budget to start tracking your spending and stay on top of your finances."
            : "Try adjusting your filters to see more budgets."
          }
          actionLabel="Create Budget"
          onAction={onCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBudgets.map((budget) => (
            <BudgetCard
              key={budget._id}
              budget={budget}
              onEdit={onEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Budget"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this budget? This action cannot be undone.
          </p>
          
          {budgetToDelete && (
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-primary-600" />
                <span className="font-medium">{budgetToDelete.name || budgetToDelete.category}</span>
                <span className="text-gray-500">•</span>
                <span>${budgetToDelete.amount}</span>
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
