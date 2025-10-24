import React from 'react'
import clsx from 'clsx'

export default function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '' 
}) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  const variantClasses = {
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    primary: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  }

  return (
    <span className={clsx(
      'inline-flex items-center font-semibold rounded-full transition-colors duration-200',
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  )
}
