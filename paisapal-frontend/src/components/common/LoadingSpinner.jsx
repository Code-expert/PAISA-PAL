import React from 'react'
import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

export default function LoadingSpinner({ 
  size = 'md', 
  className = '',
  text = '' 
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className={clsx('animate-spin text-primary-600', sizeClasses[size])} />
        {text && (
          <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  )
}
