import React from 'react'
import { FileText, Plus } from 'lucide-react'
import clsx from 'clsx'

export default function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={clsx('text-center py-12', className)}>
      <div className="w-16 h-16 mx-auto mb-6 bg-surface-container-high rounded-full flex items-center justify-center">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-medium text-on-surface mb-2">
        {title}
      </h3>
      
      <p className="text-on-surface-variant max-w-md mx-auto mb-8">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          {actionLabel}
        </button>
      )}
    </div>
  )
}
