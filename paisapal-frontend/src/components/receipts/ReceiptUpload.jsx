import React, { useState, useRef, useEffect } from 'react'
import { Upload, Camera, FileText, X, CheckCircle, Clock, AlertCircle, Loader2, Store } from 'lucide-react'
import { 
  useUploadReceiptMutation, 
  useGetReceiptStatusQuery
} from '../../services/receiptApi'
import { toast } from 'react-hot-toast'

export default function ReceiptUpload({ onReceiptUploaded }) {
  const [dragActive, setDragActive] = useState(false)
  const [previewFiles, setPreviewFiles] = useState([])
  const [uploadedReceiptIds, setUploadedReceiptIds] = useState([])
  const [processedReceipts, setProcessedReceipts] = useState([])
  const fileInputRef = useRef(null)
  
  const [uploadReceipt, { isLoading }] = useUploadReceiptMutation()

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files)
    handleFiles(files)
  }

  const handleFiles = (files) => {
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    )

    if (validFiles.length !== files.length) {
      toast.error('Please upload only images or PDF files')
    }

    const previews = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }))

    setPreviewFiles(prev => [...prev, ...previews])
  }

  const removeFile = (id) => {
    setPreviewFiles(prev => {
      const updated = prev.filter(f => f.id !== id)
      const removed = prev.find(f => f.id === id)
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview)
      }
      return updated
    })
  }

  const uploadFiles = async () => {
    if (previewFiles.length === 0) {
      toast.error('Please select files to upload')
      return
    }

    const newReceiptIds = []

    for (const fileObj of previewFiles) {
      try {
        const formData = new FormData()
        formData.append('receipt', fileObj.file)
        formData.append('filename', fileObj.name)

        const result = await uploadReceipt(formData).unwrap()
        
        toast.success(`${fileObj.name} uploaded successfully! Processing OCR...`, { icon: '📸' })
        
        const receiptId = result.data?.receipt?._id || result.data?.receipt?.id
        if (receiptId) {
          newReceiptIds.push({
            id: receiptId,
            fileName: fileObj.name,
            status: 'processing'
          })
        }
        
        if (onReceiptUploaded) {
          onReceiptUploaded(result.data)
        }
        
      } catch (error) {
        toast.error(`Failed to upload ${fileObj.name}`)
        console.error('Upload error:', error)
      }
    }

    setUploadedReceiptIds(prev => [...prev, ...newReceiptIds])
    setPreviewFiles([])
  }

  const OCRStatusTracker = ({ receiptId, fileName }) => {
    const { data, isLoading, error } = useGetReceiptStatusQuery(receiptId, {
      pollingInterval: 3000,
      skip: !receiptId,
    })

    const receipt = data?.data?.receipt || data?.receipt

    useEffect(() => {
      if (receipt && receipt.processed && receipt.ocrProcessed) {
        const amount = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0,
        }).format(receipt.amount || 0)

        toast.success(
          `✅ OCR Complete: ${receipt.merchant || fileName} - ${amount}`,
          { duration: 4000, id: `ocr-${receiptId}` }
        )
        
        setProcessedReceipts(prev => {
          if (!prev.find(r => r._id === receipt._id)) {
            return [...prev, receipt]
          }
          return prev
        })
        
        setTimeout(() => {
          setUploadedReceiptIds(prev => prev.filter(r => r.id !== receiptId))
        }, 5000)
      }
      
      if (receipt && receipt.ocrError) {
        toast.error(`❌ OCR failed for ${fileName}`, { id: `ocr-${receiptId}` })
        
        setTimeout(() => {
          setUploadedReceiptIds(prev => prev.filter(r => r.id !== receiptId))
        }, 3000)
      }
    }, [receipt, receiptId, fileName])

    if (!receipt) {
      return (
        <div className="flex items-center gap-3 p-4 rounded-xl border-2 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">{fileName}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Uploading...</p>
          </div>
        </div>
      )
    }

    if (receipt.processed && receipt.ocrProcessed) {
      const amount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
      }).format(receipt.amount || 0)

      return (
        <div className="flex items-center gap-3 p-4 rounded-xl border-2 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-700 dark:text-green-300">{fileName}</p>
            <p className="text-xs text-green-600 dark:text-green-400">
              ✓ {receipt.merchant || 'Receipt'} - {amount}
            </p>
          </div>
          {receipt.category && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-800/30 rounded-lg">
              <Store className="w-3 h-3 text-green-700 dark:text-green-300" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">{receipt.category}</span>
            </div>
          )}
        </div>
      )
    }

    if (receipt.ocrError) {
      return (
        <div className="flex items-center gap-3 p-4 rounded-xl border-2 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">{fileName}</p>
            <p className="text-xs text-red-600 dark:text-red-400">OCR failed - manual entry needed</p>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border-2 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">{fileName}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400">Processing OCR...</p>
        </div>
      </div>
    )
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Upload className="w-6 h-6 text-emerald-600" />
            Upload Receipts
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Automatic OCR processing and transaction creation
          </p>
        </div>
        {uploadedReceiptIds.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              {uploadedReceiptIds.length} processing
            </span>
          </div>
        )}
      </div>

      {/* Upload Zone */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 scale-[1.02]' 
            : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-600'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
              <Upload className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              Drop receipts here or click to browse
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Supports JPG, PNG, PDF files up to 10MB
            </p>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-3">
              🎯 Free OCR • Auto-categorization • Instant transactions
            </p>
          </div>
          
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
              className="flex items-center px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              Browse Files
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute('capture', 'environment')
                  fileInputRef.current.click()
                }
              }}
              className="flex items-center px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </button>
          </div>
        </div>
      </div>

      {/* OCR Status Display */}
      {uploadedReceiptIds.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            OCR Processing Status
          </h4>
          
          <div className="space-y-2">
            {uploadedReceiptIds.map((receipt) => (
              <OCRStatusTracker 
                key={receipt.id} 
                receiptId={receipt.id} 
                fileName={receipt.fileName} 
              />
            ))}
          </div>
        </div>
      )}

      {/* File Previews */}
      {previewFiles.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Files to Upload ({previewFiles.length})
          </h4>
          
          <div className="space-y-2">
            {previewFiles.map((fileObj) => (
              <div
                key={fileObj.id}
                className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
              >
                <div className="flex-shrink-0">
                  {fileObj.preview ? (
                    <img
                      src={fileObj.preview}
                      alt="Preview"
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-7 h-7 text-red-600 dark:text-red-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {fileObj.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formatFileSize(fileObj.size)}
                  </p>
                </div>
                
                <button
                  onClick={() => removeFile(fileObj.id)}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={uploadFiles}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Upload className="w-5 h-5 mr-2" />
            )}
            {isLoading ? 'Uploading...' : 'Upload & Process OCR'}
          </button>
        </div>
      )}

      {/* Recently Processed Summary */}
      {processedReceipts.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Recently Processed ({processedReceipts.length})
          </h4>
          <div className="space-y-2">
            {processedReceipts.slice(-3).map((receipt) => (
              <div key={receipt._id} className="flex items-center justify-between text-sm">
                <span className="text-green-700 dark:text-green-300 font-medium">
                  {receipt.merchant || 'Receipt'}
                </span>
                <span className="text-green-800 dark:text-green-200 font-bold">
                  {formatCurrency(receipt.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
