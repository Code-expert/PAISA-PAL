import React, { useState } from 'react'
import { Upload, Grid } from 'lucide-react'
import ReceiptUpload from '../components/receipts/ReceiptUpload'
import ReceiptGallery from '../components/receipts/ReceiptGallery'
import Button from '../components/ui/Button'

export default function ReceiptsPage() {
  const [activeView, setActiveView] = useState('gallery')
  const [refreshKey, setRefreshKey] = useState(0) // ✅ ADD: Trigger to refresh gallery

  // ✅ ADD: Callback when receipt is uploaded
  const handleReceiptUploaded = (receiptData) => {
    console.log('Receipt uploaded, refreshing gallery...')
    setRefreshKey(prev => prev + 1) // Force gallery to refetch
    setActiveView('gallery') // Switch to gallery to see new receipt
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          📸 Receipt Manager
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload, organize, and manage your expense receipts
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveView('gallery')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeView === 'gallery'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Grid className="w-4 h-4 inline mr-2" />
          Gallery
        </button>
        <button
          onClick={() => setActiveView('upload')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeView === 'upload'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Upload
        </button>
      </div>

      {/* Content */}
      {activeView === 'upload' ? (
        <ReceiptUpload onReceiptUploaded={handleReceiptUploaded} />
      ) : (
        <ReceiptGallery key={refreshKey} /> // ✅ FIXED: key prop forces refetch
      )}
    </div>
  )
}
