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
    <div className={clsx('flex items-center justify-center p-4', className)}>
      <div className="flex flex-col items-center space-y-3">
        {/* Spinner with gradient effect */}
        <div className="relative">
          <Loader2 
            className={clsx(
              'animate-spin text-emerald-600 dark:text-emerald-400 transition-colors duration-300',
              sizeClasses[size]
            )} 
          />
          {/* Optional: Add a subtle glow effect */}
          <div className={clsx(
            'absolute inset-0 animate-spin rounded-full bg-emerald-400/20 dark:bg-emerald-500/20 blur-sm',
            sizeClasses[size]
          )} />
        </div>
        
        {/* Loading text with smooth animation */}
        {text && (
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 animate-pulse transition-colors duration-300">
            {text}
          </p>
        )}
      </div>
    </div>
  )
}
