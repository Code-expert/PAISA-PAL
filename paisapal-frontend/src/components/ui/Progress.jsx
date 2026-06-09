import React from 'react'
import clsx from 'clsx'

export default function Progress({ 
  value = 0, 
  variant = 'primary', 
  size = 'md',
  className = '',
  showLabel = false
}) {
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3'
  }

  const variantClasses = {
    primary: 'bg-primary text-on-primary',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    error: 'bg-gradient-to-r from-red-500 to-pink-600'
  }

  return (
    <div className={clsx('w-full', className)}>
      <div className={clsx(
        'w-full bg-outline-variant/50 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div 
          className={clsx(
            'h-full rounded-full transition-all duration-500 ease-out',
            variantClasses[variant]
          )}
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-on-surface-variant mt-1">
          {value.toFixed(0)}%
        </p>
      )}
    </div>
  )
}
