import React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import clsx from 'clsx'

const Input = React.forwardRef(({ 
  className = '', 
  type = 'text',
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [inputType, setInputType] = React.useState(type)

  React.useEffect(() => {
    if (showPasswordToggle && type === 'password') {
      setInputType(showPassword ? 'text' : 'password')
    } else {
      setInputType(type)
    }
  }, [showPassword, type, showPasswordToggle])

  const baseClasses = 'block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-white dark:bg-gray-800 transition-colors'

  const errorClasses = error 
    ? 'ring-red-300 dark:ring-red-600 focus:ring-red-600' 
    : ''

  const iconPaddingLeft = leftIcon ? 'pl-10' : 'pl-3'
  const iconPaddingRight = (rightIcon || showPasswordToggle) ? 'pr-10' : 'pr-3'

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-400 sm:text-sm">
              {leftIcon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          className={clsx(
            baseClasses,
            errorClasses,
            iconPaddingLeft,
            iconPaddingRight,
            className
          )}
          {...props}
        />
        
        {(rightIcon || showPasswordToggle) && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {showPasswordToggle && type === 'password' ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            ) : rightIcon ? (
              <span className="text-gray-400 sm:text-sm">
                {rightIcon}
              </span>
            ) : null}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
