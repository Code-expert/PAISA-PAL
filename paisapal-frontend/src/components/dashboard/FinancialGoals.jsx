import React from 'react'
import { Target, TrendingUp, Calendar, CheckCircle } from 'lucide-react'
import Card from '../ui/Card'
import Progress from '../ui/Progress'
import Badge from '../ui/Badge'

const GoalItem = ({ goal }) => {
  const progress = (goal.current / goal.target) * 100
  const isCompleted = progress >= 100
  const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isCompleted ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <Target className="w-5 h-5 text-primary-500" />
          )}
          <span className="font-medium text-gray-900 dark:text-white">
            {goal.name}
          </span>
        </div>
        <Badge 
          variant={isCompleted ? 'success' : progress > 75 ? 'warning' : 'default'} 
          size="sm"
        >
          {isCompleted ? 'Complete' : `${Math.round(progress)}%`}
        </Badge>
      </div>
      
      <Progress 
        value={Math.min(progress, 100)}
        variant={isCompleted ? 'success' : 'primary'}
        size="md"
      />
      
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {formatCurrency(goal.current)} of {formatCurrency(goal.target)}
        </span>
        <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3" />
          <span>
            {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function FinancialGoals({ goals = [] }) {
  // Mock goals for demo (replace with actual data)
  const mockGoals = [
    {
      id: 1,
      name: 'Emergency Fund',
      current: 8500,
      target: 15000,
      deadline: '2025-12-31',
    },
    {
      id: 2,
      name: 'Vacation Fund',
      current: 2800,
      target: 5000,
      deadline: '2025-06-15',
    },
    {
      id: 3,
      name: 'New Car',
      current: 12000,
      target: 25000,
      deadline: '2026-03-01',
    }
  ]

  const displayGoals = goals.length > 0 ? goals : mockGoals

  const completedGoals = displayGoals.filter(goal => (goal.current / goal.target) >= 1).length
  const totalGoals = displayGoals.length

  return (
    <Card>
      <Card.Header>
        <Card.Title>Financial Goals</Card.Title>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {completedGoals}/{totalGoals} completed
          </span>
        </div>
      </Card.Header>
      
      <Card.Content>
        <div className="space-y-6">
          {displayGoals.map((goal) => (
            <GoalItem key={goal.id} goal={goal} />
          ))}
        </div>
      </Card.Content>
      
      <Card.Footer>
        <button className="btn-secondary w-full">
          Manage Goals
        </button>
      </Card.Footer>
    </Card>
  )
}
