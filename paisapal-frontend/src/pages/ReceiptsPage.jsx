import React from 'react'
import { Upload, Receipt } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/common/EmptyState'

export default function ReceiptsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Receipts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload and manage your receipts with AI-powered OCR
          </p>
        </div>
        
        <Button
          variant="primary"
          leftIcon={<Upload className="w-4 h-4" />}
        >
          Upload Receipt
        </Button>
      </div>

      {/* Content */}
      <EmptyState
        icon={Receipt}
        title="No receipts uploaded"
        description="Upload your first receipt to automatically extract transaction details using AI."
        actionLabel="Upload Receipt"
        onAction={() => {}}
      />
    </div>
  )
}
