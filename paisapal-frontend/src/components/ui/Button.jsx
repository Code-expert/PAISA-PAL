import React from 'react'
import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

const Button = React.forwardRef(({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 border-primary-600',
    secondary: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-primary-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 border-green-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border-red-600',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 border-yellow-600',
    ghost: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-primary-500',
    link: 'text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline focus:ring-primary-500',
  }

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-6 py-3 text-base',
  }

  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {leftIcon && !loading && (
        <span className="mr-2">{leftIcon}</span>
      )}
      {children}
      {rightIcon && !loading && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
