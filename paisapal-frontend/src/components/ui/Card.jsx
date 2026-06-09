import React from 'react'
import clsx from 'clsx'

const Card = React.forwardRef(({ 
  children, 
  className = '', 
  padding = true,
  hover = false,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(
        'bg-surface-container backdrop-blur-md rounded-lg border border-outline-variant/30 shadow-sm',
        padding && 'p-6',
        hover && 'hover:shadow-md transition-shadow duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

const CardHeader = ({ children, className = '' }) => (
  <div className={clsx('flex items-center justify-between mb-4', className)}>
    {children}
  </div>
)

const CardTitle = ({ children, className = '' }) => (
  <h3 className={clsx('text-lg font-semibold text-on-surface', className)}>
    {children}
  </h3>
)

const CardContent = ({ children, className = '' }) => (
  <div className={clsx('text-on-surface-variant', className)}>
    {children}
  </div>
)

const CardFooter = ({ children, className = '' }) => (
  <div className={clsx('mt-4 pt-4 border-t border-outline-variant/30', className)}>
    {children}
  </div>
)

Card.displayName = 'Card'
Card.Header = CardHeader
Card.Title = CardTitle
Card.Content = CardContent
Card.Footer = CardFooter

export default Card
