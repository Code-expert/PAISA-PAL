import React, { useState, useEffect } from 'react'
import { Search, Download, Trash2, Eye, Link as LinkIcon, Calendar, FileText, RefreshCw } from 'lucide-react'
import { useGetReceiptsQuery, useDeleteReceiptMutation } from '../../services/receiptApi'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import Modal from '../ui/Modal'
import Badge from '../ui/Badge'

export default function ReceiptGallery() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const { data: receiptsData, isLoading, refetch } = useGetReceiptsQuery({
    page: 1,
    limit: 100,
  })
  
  // ✅ FIX: Remove trailing slash
  const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

  const [deleteReceipt] = useDeleteReceiptMutation()

  const receipts = receiptsData?.data?.receipts || []

  useEffect(() => {
    refetch()
  }, [refetch])

  // ✅ FIX: Helper function to get correct image URL
  const getImageUrl = (fileUrl) => {
    if (!fileUrl) return ''
    if (fileUrl.startsWith('http')) return fileUrl
    
    // Remove /api/ prefix if present and ensure leading slash
    const cleanUrl = fileUrl.replace('/api/uploads', '/uploads')
    return `${API_BASE_URL}${cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl}`
  }

  // ✅ FIX: Case-insensitive filter
  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.extractedText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.merchant?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || 
      receipt.category?.toLowerCase() === selectedCategory.toLowerCase()
    
    return matchesSearch && matchesCategory
  })

  const handleViewReceipt = (receipt) => {
    setSelectedReceipt(receipt)
    setIsViewModalOpen(true)
  }

  const handleDeleteReceipt = async (receiptId) => {
    if (window.confirm('Are you sure you want to delete this receipt?')) {
      try {
        await deleteReceipt(receiptId).unwrap()
        toast.success('Receipt deleted successfully', { icon: '🗑️' })
        refetch()
      } catch (error) {
        toast.error('Failed to delete receipt')
        console.error('Delete error:', error)
      }
    }
  }

  const handleDownloadReceipt = (receipt) => {
    const link = document.createElement('a')
    link.href = getImageUrl(receipt.fileUrl)
    link.download = receipt.filename
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Receipt downloaded', { icon: '⬇️' })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const categories = ['all', 'Food & Dining', 'transport', 'shopping', 'utilities', 'healthcare', 'entertainment', 'other']

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading receipts...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Receipt Gallery
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {filteredReceipts.length} of {receipts.length} receipt{receipts.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search receipts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {/* Refresh Button */}
            <button
              onClick={() => refetch()}
              className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredReceipts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No receipts found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Upload your first receipt to get started'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredReceipts.map((receipt, index) => (
              <div
                key={receipt._id}
                className="group relative bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 animate-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Receipt Preview */}
                <div className="aspect-[3/4] bg-white dark:bg-gray-800 relative overflow-hidden">
                  {receipt.fileType?.startsWith('image/') ? (
                    <img
                      src={getImageUrl(receipt.fileUrl)}
                      alt={receipt.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        console.error('Image failed to load:', receipt.fileUrl)
                        if (!e.target.dataset.fallback) {
                          e.target.dataset.fallback = 'true'
                          e.target.style.display = 'none'
                          const parent = e.target.parentElement
                          if (parent && !parent.querySelector('.fallback-icon')) {
                            const fallbackDiv = document.createElement('div')
                            fallbackDiv.className = 'w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 fallback-icon'
                            fallbackDiv.innerHTML = `
                              <div class="text-center">
                                <svg class="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p class="text-sm text-gray-500 mt-2">Image unavailable</p>
                              </div>
                            `
                            parent.appendChild(fallbackDiv)
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">PDF Document</p>
                      </div>
                    </div>
                  )}

                  {/* ✅ FIX: Overlay Actions with z-index */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center z-10">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                      <button
                        onClick={() => handleViewReceipt(receipt)}
                        className="p-3 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
                        title="View"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDownloadReceipt(receipt)}
                        className="p-3 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteReceipt(receipt._id)}
                        className="p-3 bg-white text-red-600 rounded-xl hover:bg-red-50 transition-colors shadow-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Receipt Info */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate mb-2">
                    {receipt.filename}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-3">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {format(new Date(receipt.createdAt || receipt.uploadDate), 'MMM dd, yyyy')}
                    </span>
                    {receipt.amount && (
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(receipt.amount)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {receipt.category && (
                      <Badge variant="secondary" size="sm">
                        {receipt.category}
                      </Badge>
                    )}

                    {receipt.linkedTransaction && (
                      <div className="flex items-center text-xs text-green-600 dark:text-green-400 font-medium">
                        <LinkIcon className="w-3 h-3 mr-1" />
                        Linked
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receipt View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Receipt Details"
        size="lg"
      >
        {selectedReceipt && (
          <div className="space-y-6">
            {/* Receipt Preview */}
            <div className="flex justify-center bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
              {selectedReceipt.fileType?.startsWith('image/') ? (
                <img
                  src={getImageUrl(selectedReceipt.fileUrl)}
                  alt={selectedReceipt.filename}
                  className="max-w-full max-h-96 object-contain rounded-lg"
                />
              ) : (
                <div className="w-64 h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">PDF Document</p>
                    <button
                      onClick={() => window.open(getImageUrl(selectedReceipt.fileUrl), '_blank')}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Open PDF
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Receipt Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Filename
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedReceipt.filename}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Upload Date
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {format(new Date(selectedReceipt.createdAt || selectedReceipt.uploadDate), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>

              {selectedReceipt.amount && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Amount
                  </label>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(selectedReceipt.amount)}
                  </p>
                </div>
              )}

              {selectedReceipt.category && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <Badge variant="secondary">{selectedReceipt.category}</Badge>
                </div>
              )}

              {selectedReceipt.merchant && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Merchant
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedReceipt.merchant}</p>
                </div>
              )}
            </div>

            {/* Extracted Text */}
            {selectedReceipt.extractedText && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Extracted Text
                </label>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-sm text-gray-900 dark:text-white whitespace-pre-wrap max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700">
                  {selectedReceipt.extractedText}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleDownloadReceipt(selectedReceipt)}
                className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>

              <button
                onClick={() => {
                  handleDeleteReceipt(selectedReceipt._id)
                  setIsViewModalOpen(false)
                }}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
