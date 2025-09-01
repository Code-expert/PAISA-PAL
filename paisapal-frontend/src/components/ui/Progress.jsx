import React from 'react'
import clsx from 'clsx'

const Progress = ({ 
  value = 0, 
  max = 100, 
  size = 'md',
  variant = 'primary',
  showLabel = false,
  label,
  className = '' 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  const variants = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
  }

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          {showLabel && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <div className={clsx(
        'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
        sizes[size],
        className
      )}>
        <div
          className={clsx(
            'h-full transition-all duration-300 ease-in-out rounded-full',
            variants[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default Progress
