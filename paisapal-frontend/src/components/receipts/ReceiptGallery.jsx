import React, { useState, useEffect } from 'react' // ✅ Added useEffect
import { Search, Filter, Download, Trash2, Eye, Link, Calendar, FileText } from 'lucide-react'
import { useGetReceiptsQuery, useDeleteReceiptMutation } from '../../services/receiptApi' // ✅ Fixed import
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import Badge from '../ui/Badge'

export default function ReceiptGallery() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // ✅ FIXED: Use correct query hook
  const { data: receiptsData, isLoading, refetch } = useGetReceiptsQuery({
    page: 1,
    limit: 100, // Get all receipts
  })
  const API_BASE_URL = 'http://localhost:5000'

  const [deleteReceipt] = useDeleteReceiptMutation()

  // ✅ FIXED: Extract receipts from correct data structure
  const receipts = receiptsData?.data?.receipts || []

  // ✅ ADD: Refetch on component mount to always show latest
  useEffect(() => {
    refetch()
  }, [refetch])

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.extractedText?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || receipt.category === selectedCategory
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
        toast.success('Receipt deleted successfully')
        refetch() // ✅ Refresh gallery after delete
      } catch (error) {
        toast.error('Failed to delete receipt')
      }
    }
  }

  const handleDownloadReceipt = (receipt) => {
    const link = document.createElement('a')
    link.href = receipt.fileUrl
    link.download = receipt.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const categories = ['all', 'food', 'transport', 'shopping', 'utilities', 'healthcare', 'other']

  if (isLoading) {
    return (
      <Card>
        <Card.Content>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading receipts...</p>
            </div>
          </div>
        </Card.Content>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <Card.Header>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <Card.Title>
              Receipt Gallery ({receipts.length}) {/* ✅ Show count */}
            </Card.Title>

            <div className="flex space-x-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search receipts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>

              {/* ✅ ADD: Manual refresh button */}
              <button
                onClick={() => refetch()}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                title="Refresh"
              >
                🔄
              </button>
            </div>
          </div>
        </Card.Header>

        <Card.Content>
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredReceipts.map((receipt) => (
                <div
                  key={receipt._id}
                  className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Receipt Preview */}
                  <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                    {receipt.fileType?.startsWith('image/') ? (

                      <img
                        src={`${API_BASE_URL}${receipt.fileUrl}`}
                        alt={receipt.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          // ✅ Prevent infinite loop
                          if (e.target.src !== e.target.dataset.fallback) {
                            e.target.dataset.fallback = 'true'
                            // ✅ Use a data URL placeholder or hide the image
                            e.target.style.display = 'none'
                            const parent = e.target.parentElement
                            if (parent && !parent.querySelector('.fallback-icon')) {
                              parent.innerHTML = `
            <div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 fallback-icon">
              <div class="text-center">
                <svg class="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="text-xs text-gray-500 mt-2">Image unavailable</p>
              </div>
            </div>
          `
                            }
                          }
                        }}
                      />
                    ) : (

                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <FileText className="w-6 h-6 text-red-600" />
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">PDF</p>
                        </div>
                      </div>
                    )}

                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                        <button
                          onClick={() => handleViewReceipt(receipt)}
                          className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadReceipt(receipt)}
                          className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReceipt(receipt._id)}
                          className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Receipt Info */}
                  <div className="p-3">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate mb-1">
                      {receipt.filename}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(receipt.createdAt || receipt.uploadDate), 'MMM dd, yyyy')}
                      </span>
                      {receipt.amount && (
                        <span className="font-medium">${receipt.amount}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      {receipt.category && (
                        <Badge variant="secondary" size="sm">
                          {receipt.category}
                        </Badge>
                      )}

                      {receipt.linkedTransaction && (
                        <div className="flex items-center text-xs text-green-600">
                          <Link className="w-3 h-3 mr-1" />
                          Linked
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>

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
            <div className="flex justify-center">
              {selectedReceipt.fileType?.startsWith('image/') ? (
                <img
                  src={selectedReceipt.fileUrl}
                  alt={selectedReceipt.filename}
                  className="max-w-full max-h-96 object-contain rounded-lg"
                />
              ) : (
                <div className="w-64 h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">PDF Document</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => window.open(selectedReceipt.fileUrl, '_blank')}
                      className="mt-2"
                    >
                      Open PDF
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Receipt Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filename
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedReceipt.filename}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Upload Date
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {format(new Date(selectedReceipt.createdAt || selectedReceipt.uploadDate), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>

              {selectedReceipt.amount && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">${selectedReceipt.amount}</p>
                </div>
              )}

              {selectedReceipt.category && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <Badge variant="secondary">{selectedReceipt.category}</Badge>
                </div>
              )}
            </div>

            {/* Extracted Text */}
            {selectedReceipt.extractedText && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Extracted Text
                </label>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm text-gray-900 dark:text-white whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {selectedReceipt.extractedText}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => handleDownloadReceipt(selectedReceipt)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>

              <Button
                variant="danger"
                onClick={() => {
                  handleDeleteReceipt(selectedReceipt._id)
                  setIsViewModalOpen(false)
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
