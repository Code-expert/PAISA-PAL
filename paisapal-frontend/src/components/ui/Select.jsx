import React from 'react'

export default function Select({ 
  label, 
  error, 
  leftIcon,  // ✅ Extract leftIcon
  options = [],
  placeholder,
  className = '', 
  ...props 
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <select
          className={`
            w-full rounded-lg border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-700
            ${leftIcon ? 'pl-10' : 'pl-4'} pr-10 py-2
            text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-primary-500
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}  // ✅ leftIcon not included here
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {props.children}
        </select>
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
