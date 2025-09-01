import React from 'react'
import { Switch as HeadlessSwitch } from '@headlessui/react'
import clsx from 'clsx'

const Switch = ({ 
  checked, 
  onChange, 
  label, 
  description,
  disabled = false,
  size = 'md',
  className = '' 
}) => {
  const sizes = {
    sm: 'h-4 w-7',
    md: 'h-6 w-11',
    lg: 'h-8 w-14',
  }

  const toggleSizes = {
    sm: 'h-3 w-3',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
  }

  const translateX = {
    sm: checked ? 'translate-x-3' : 'translate-x-0',
    md: checked ? 'translate-x-5' : 'translate-x-0',
    lg: checked ? 'translate-x-6' : 'translate-x-0',
  }

  return (
    <HeadlessSwitch.Group as="div" className="flex items-center justify-between">
      {(label || description) && (
        <span className="flex-grow flex flex-col">
          {label && (
            <HeadlessSwitch.Label 
              as="span" 
              className="text-sm font-medium text-gray-900 dark:text-white" 
              passive
            >
              {label}
            </HeadlessSwitch.Label>
          )}
          {description && (
            <HeadlessSwitch.Description 
              as="span" 
              className="text-sm text-gray-500 dark:text-gray-400"
            >
              {description}
            </HeadlessSwitch.Description>
          )}
        </span>
      )}
      
      <HeadlessSwitch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={clsx(
          'relative inline-flex flex-shrink-0 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
          checked ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700',
          disabled && 'opacity-50 cursor-not-allowed',
          sizes[size],
          className
        )}
      >
        <span
          aria-hidden="true"
          className={clsx(
            'pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
            translateX[size],
            toggleSizes[size]
          )}
        />
      </HeadlessSwitch>
    </HeadlessSwitch.Group>
  )
}

export default Switch
