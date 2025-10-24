import React, { useState } from 'react'
import { Upload, Grid, Image } from 'lucide-react'
import ReceiptUpload from '../components/receipts/ReceiptUpload'
import ReceiptGallery from '../components/receipts/ReceiptGallery'

export default function ReceiptsPage() {
  const [activeView, setActiveView] = useState('gallery')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleReceiptUploaded = (receiptData) => {
    console.log('Receipt uploaded, refreshing gallery...')
    setRefreshKey(prev => prev + 1)
    setActiveView('gallery')
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
            <Image className="w-8 h-8 text-emerald-600" />
            Receipt Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Upload, organize, and manage your expense receipts with OCR
          </p>
        </div>

        {/* Quick Upload Button */}
        <button
          onClick={() => setActiveView('upload')}
          className="flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Upload className="w-5 h-5 mr-2" />
          Upload Receipt
        </button>
      </div>

      {/* View Toggle - Modern Tab Design */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-1.5">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('gallery')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
              activeView === 'gallery'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Grid className="w-4 h-4" />
            Gallery
            {activeView === 'gallery' && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                Active
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveView('upload')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
              activeView === 'upload'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload
            {activeView === 'upload' && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                Active
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content with Smooth Transition */}
      <div className="animate-in fade-in duration-300">
        {activeView === 'upload' ? (
          <ReceiptUpload onReceiptUploaded={handleReceiptUploaded} />
        ) : (
          <ReceiptGallery key={refreshKey} />
        )}
      </div>
    </div>
  )
}
