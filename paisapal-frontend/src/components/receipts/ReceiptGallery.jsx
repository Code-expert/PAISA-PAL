import React, { useState, useEffect } from 'react'
import { Search, Download, Trash2, Eye, Link as LinkIcon, Calendar, FileText, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
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

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory])

  const totalItems = filteredReceipts.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentReceipts = filteredReceipts.slice(startIndex, endIndex)

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

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

  const categories = ['all', 'food', 'transportation', 'shopping', 'utilities', 'healthcare', 'entertainment', 'other']

  if (isLoading) {
    return (
      <div className="bg-surface-container backdrop-blur-md rounded-3xl border border-outline-variant/30 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-on-surface-variant">Loading receipts...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-surface-container backdrop-blur-md rounded-3xl border border-outline-variant/30 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-on-surface">
              Receipt Gallery
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
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
                className="w-full pl-10 pr-4 py-2.5 border border-outline-variant/50 rounded-xl bg-white dark:bg-gray-700 text-on-surface placeholder-gray-400 focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-outline-variant/50 rounded-xl bg-white dark:bg-gray-700 text-on-surface focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
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
              className="p-2.5 border border-outline-variant/50 rounded-xl bg-white dark:bg-gray-700 text-on-surface-variant hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredReceipts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-on-surface mb-2">
              No receipts found
            </h3>
            <p className="text-on-surface-variant">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Upload your first receipt to get started'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-on-surface-variant text-sm">
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">Date</th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">Filename / Merchant</th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">Category</th>
                  <th className="py-3 px-4 font-semibold text-right whitespace-nowrap">Amount</th>
                  <th className="py-3 px-4 font-semibold text-center whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 font-semibold text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {currentReceipts.map((receipt, index) => (
                  <tr 
                    key={receipt._id}
                    className="hover:bg-surface-container-highest/50 transition-colors animate-in slide-in-from-bottom"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="py-3 px-4 text-sm text-on-surface whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-2 text-on-surface-variant" />
                        {format(new Date(receipt.createdAt || receipt.uploadDate), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="py-3 px-4 min-w-[200px]">
                      <div className="font-semibold text-on-surface text-sm truncate max-w-[250px]" title={receipt.filename}>{receipt.filename}</div>
                      {receipt.merchant && (
                        <div className="text-xs text-on-surface-variant mt-0.5">{receipt.merchant}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {receipt.category ? (
                        <Badge variant="secondary" size="sm">{receipt.category}</Badge>
                      ) : (
                        <span className="text-xs text-on-surface-variant">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {receipt.amount ? (
                        <span className="font-semibold text-on-surface">
                          {formatCurrency(receipt.amount)}
                        </span>
                      ) : (
                        <span className="text-xs text-on-surface-variant">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {receipt.linkedTransaction ? (
                        <div className="inline-flex items-center text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                          <LinkIcon className="w-3 h-3 mr-1" />
                          Linked
                        </div>
                      ) : (
                        <div className="inline-flex items-center text-xs text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded-full">
                          Unlinked
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewReceipt(receipt)}
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadReceipt(receipt)}
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReceipt(receipt._id)}
                          className="p-1.5 text-on-surface-variant hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 mt-4 border-t border-outline-variant/30">
              <div className="text-sm text-on-surface-variant">
                Showing <span className="font-semibold text-on-surface">{startIndex + 1}</span> to{' '}
                <span className="font-semibold text-on-surface">{Math.min(endIndex, totalItems)}</span> of{' '}
                <span className="font-semibold text-on-surface">{totalItems}</span> receipts
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center px-3 py-2 text-sm font-semibold text-on-surface bg-surface-container backdrop-blur-md border border-outline-variant/50 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>

                <div className="flex items-center space-x-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1
                    if (page === 1 || page === totalPages || Math.abs(currentPage - page) <= 1) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                            currentPage === page
                              ? 'bg-primary text-on-primary shadow-md'
                              : 'text-on-surface bg-surface-container backdrop-blur-md border border-outline-variant/50 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2 text-gray-400">...</span>
                    }
                    return null
                  })}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-3 py-2 text-sm font-semibold text-on-surface bg-surface-container backdrop-blur-md border border-outline-variant/50 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}
          </>
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
                  className="max-w-full max-h-96 object-contain bg-white rounded-lg p-2"
                />
              ) : (
                <div className="w-64 h-64 bg-surface-container-high rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                    <p className="text-on-surface-variant mb-4">PDF Document</p>
                    <button
                      onClick={() => window.open(getImageUrl(selectedReceipt.fileUrl), '_blank')}
                      className="px-4 py-2 bg-outline-variant/50 text-on-surface rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  Filename
                </label>
                <p className="text-sm text-on-surface">{selectedReceipt.filename}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  Upload Date
                </label>
                <p className="text-sm text-on-surface">
                  {format(new Date(selectedReceipt.createdAt || selectedReceipt.uploadDate), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>

              {selectedReceipt.amount && (
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">
                    Amount
                  </label>
                  <p className="text-sm font-bold text-on-surface">
                    {formatCurrency(selectedReceipt.amount)}
                  </p>
                </div>
              )}

              {selectedReceipt.category && (
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">
                    Category
                  </label>
                  <Badge variant="secondary">{selectedReceipt.category}</Badge>
                </div>
              )}

              {selectedReceipt.merchant && (
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">
                    Merchant
                  </label>
                  <p className="text-sm text-on-surface">{selectedReceipt.merchant}</p>
                </div>
              )}
            </div>

            {/* Extracted Text */}
            {selectedReceipt.extractedText && (
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">
                  Extracted Text
                </label>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-sm text-on-surface whitespace-pre-wrap max-h-64 overflow-y-auto border border-outline-variant/30">
                  {selectedReceipt.extractedText}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
              <button
                onClick={() => handleDownloadReceipt(selectedReceipt)}
                className="flex items-center px-4 py-2 bg-surface-container-highest text-on-surface rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
