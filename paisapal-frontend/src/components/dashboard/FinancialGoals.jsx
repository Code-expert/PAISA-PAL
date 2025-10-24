import React from 'react'
import { Target, TrendingUp, Calendar, CheckCircle, Plus, ArrowRight } from 'lucide-react'
import Progress from '../ui/Progress'
import Badge from '../ui/Badge'
import EmptyState from '../common/EmptyState'
import { Link } from 'react-router-dom'

const GoalItem = ({ goal }) => {
  const progress = (goal.current / goal.target) * 100
  const isCompleted = progress >= 100
  const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
  const isOverdue = daysLeft < 0

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="group p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isCompleted 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-emerald-100 dark:bg-emerald-900/30'
            }`}>
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {goal.name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round(progress)}% achieved
              </p>
            </div>
          </div>
          <Badge 
            variant={isCompleted ? 'success' : progress > 75 ? 'warning' : 'primary'} 
            size="sm"
          >
            {isCompleted ? '✓ Complete' : `${Math.round(progress)}%`}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <Progress 
          value={Math.min(progress, 100)}
          variant={isCompleted ? 'success' : 'primary'}
          size="md"
        />
        
        {/* Details */}
        <div className="flex justify-between items-center text-sm pt-1">
          <div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(goal.current)}
            </span>
            <span className="text-gray-500 dark:text-gray-400"> / </span>
            <span className="text-gray-600 dark:text-gray-400">
              {formatCurrency(goal.target)}
            </span>
          </div>
          <div className={`flex items-center space-x-1.5 ${
            isOverdue 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">
              {isOverdue 
                ? `${Math.abs(daysLeft)} days overdue` 
                : daysLeft > 0 
                ? `${daysLeft} days left` 
                : 'Due today'}
            </span>
          </div>
        </div>

        {/* Remaining amount */}
        {!isCompleted && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(goal.target - goal.current)}
              </span>
              {' '}more needed to reach your goal
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function FinancialGoals({ goals = [] }) {
  const displayGoals = goals.length > 0 ? goals : []
  const completedGoals = displayGoals.filter(goal => (goal.current / goal.target) >= 1).length
  const totalGoals = displayGoals.length
  const completionRate = totalGoals > 0 ? ((completedGoals / totalGoals) * 100).toFixed(0) : 0

  if (displayGoals.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <Target className="w-5 h-5 mr-2 text-emerald-600" />
            Financial Goals
          </h3>
        </div>
        <EmptyState 
          icon={Target}
          title="No goals set"
          message="Set financial goals to track your savings and stay motivated"
          action={
            <Link 
              to="/goals/new"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Goal
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <Target className="w-5 h-5 mr-2 text-emerald-600" />
            Financial Goals
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track your savings milestones
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg">
          <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
            {completedGoals}/{totalGoals} completed
          </span>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4 mb-6">
        {displayGoals.map((goal, index) => (
          <div 
            key={goal.id || goal._id}
            className="animate-in slide-in-from-bottom duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <GoalItem goal={goal} />
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {completionRate}%
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Overall Progress
            </p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalGoals - completedGoals}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Goals Remaining
            </p>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to="/goals"
          className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 group"
        >
          Manage All Goals
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </div>
  )
}
