import React from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { Check, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

const Select = React.forwardRef(({ 
  options = [],
  value,
  onChange,
  placeholder = 'Select an option...',
  label,
  error,
  disabled = false,
  className = '',
  ...props 
}, ref) => {
  const selectedOption = options.find(option => option.value === value)

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white mb-2">
          {label}
        </label>
      )}
      
      <Listbox 
        value={value} 
        onChange={onChange}
        disabled={disabled}
      >
        <div className="relative">
          <Listbox.Button
            ref={ref}
            className={clsx(
              'relative w-full cursor-default rounded-md bg-white dark:bg-gray-800 py-1.5 pl-3 pr-10 text-left text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6',
              disabled && 'opacity-50 cursor-not-allowed',
              error && 'ring-red-300 dark:ring-red-600 focus:ring-red-600',
              className
            )}
            {...props}
          >
            <span className="block truncate">
              {selectedOption?.label || placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active }) =>
                    clsx(
                      'relative cursor-default select-none py-2 pl-10 pr-4',
                      active 
                        ? 'bg-primary-600 text-white' 
                        : 'text-gray-900 dark:text-white'
                    )
                  }
                  value={option.value}
                  disabled={option.disabled}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={clsx(
                          'block truncate',
                          selected ? 'font-medium' : 'font-normal'
                        )}
                      >
                        {option.label}
                      </span>
                      {selected ? (
                        <span
                          className={clsx(
                            'absolute inset-y-0 left-0 flex items-center pl-3',
                            active ? 'text-white' : 'text-primary-600'
                          )}
                        >
                          <Check className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
