import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Upload, 
  Target, 
  TrendingUp, 
  Receipt,
  CreditCard
} from 'lucide-react'
import Card from '../ui/Card'

const ActionButton = ({ to, icon: Icon, title, description, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400',
    success: 'bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-400',
    warning: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
    info: 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  }

  return (
    <Link
      to={to}
      className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-start space-x-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {title}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default function QuickActions() {
  const actions = [
    {
      to: '/transactions?action=add',
      icon: Plus,
      title: 'Add Transaction',
      description: 'Record income or expense',
      color: 'primary'
    },
    {
      to: '/receipts/upload',
      icon: Upload,
      title: 'Upload Receipt',
      description: 'Scan receipt with AI',
      color: 'info'
    },
    {
      to: '/budgets?action=create',
      icon: Target,
      title: 'Create Budget',
      description: 'Set spending limits',
      color: 'warning'
    },
    {
      to: '/investments?action=add',
      icon: TrendingUp,
      title: 'Add Investment',
      description: 'Track portfolio',
      color: 'success'
    }
  ]

  return (
    <Card>
      <Card.Header>
        <Card.Title>Quick Actions</Card.Title>
      </Card.Header>
      
      <Card.Content>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <ActionButton key={index} {...action} />
          ))}
        </div>
      </Card.Content>
    </Card>
  )
}
