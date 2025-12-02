import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Upload, 
  Target, 
  TrendingUp, 
  Zap
} from 'lucide-react'

const ActionButton = ({ to, icon: Icon, title, description, gradient }) => {
  return (
    <Link
      to={to}
      className="group block p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-transparent hover:shadow-lg transition-all duration-300 overflow-hidden relative"
    >
      {/* Gradient background on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      {/* Content */}
      <div className="relative flex flex-col items-center text-center space-y-3">
        <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-md group-hover:scale-110 transition-all duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-white transition-colors duration-300">
            {title}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-white/90 transition-colors duration-300 mt-1">
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
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      to: '/receipts/uploads',
      icon: Upload,
      title: 'Upload Receipt',
      description: 'Scan receipt with AI',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      to: '/budgets?action=create',
      icon: Target,
      title: 'Create Budget',
      description: 'Set spending limits',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      to: '/investments?action=add',
      icon: TrendingUp,
      title: 'Add Investment',
      description: 'Track portfolio',
      gradient: 'from-purple-500 to-pink-600'
    }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          <Zap className="w-5 h-5 mr-2 text-emerald-600" />
          Quick Actions
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Fast access to common tasks
        </p>
      </div>

      {/* Action Grid - 2x2 layout */}
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <ActionButton key={index} {...action} />
        ))}
      </div>
    </div>
  )
}
