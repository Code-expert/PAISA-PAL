import React, { useState, useRef, useEffect } from 'react'
import { Upload, Camera, FileText, X, CheckCircle, Clock, AlertCircle, Loader2, DollarSign, Store } from 'lucide-react'
import { 
  useUploadReceiptMutation, 
  useGetReceiptStatusQuery // ✅ Use RTK Query hook instead of fetch
} from '../../services/receiptApi'
import { toast } from 'react-hot-toast'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function ReceiptUpload({ onReceiptUploaded }) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewFiles, setPreviewFiles] = useState([])
  const [uploadedReceiptIds, setUploadedReceiptIds] = useState([]) // ✅ Track uploaded receipts
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
        
        toast.success(`${fileObj.name} uploaded successfully! Processing OCR...`)
        
        // ✅ Store receipt ID for polling
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

    // ✅ Add to tracking list
    setUploadedReceiptIds(prev => [...prev, ...newReceiptIds])
    
    // Clear previews after upload
    setPreviewFiles([])
  }

  // ✅ OCR Status Polling Component
  const OCRStatusTracker = ({ receiptId, fileName }) => {
    const { data, isLoading, error } = useGetReceiptStatusQuery(receiptId, {
      pollingInterval: 3000, // Poll every 3 seconds
      skip: !receiptId, // Don't query if no ID
    })

    const receipt = data?.data?.receipt || data?.receipt

    // ✅ Show completion status
    useEffect(() => {
      if (receipt && receipt.processed && receipt.ocrProcessed) {
        toast.success(
          `✅ OCR Complete: ${receipt.merchant || fileName} - $${receipt.amount || '0.00'}`,
          { duration: 4000, id: `ocr-${receiptId}` }
        )
        
        setProcessedReceipts(prev => {
          if (!prev.find(r => r._id === receipt._id)) {
            return [...prev, receipt]
          }
          return prev
        })
        
        // ✅ Remove from tracking after completion
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
        <div className="flex items-center gap-3 p-3 rounded-lg border-2 bg-blue-50 border-blue-200">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-600">{fileName}</p>
            <p className="text-xs text-blue-600 opacity-80">Uploading...</p>
          </div>
        </div>
      )
    }

    if (receipt.processed && receipt.ocrProcessed) {
      return (
        <div className="flex items-center gap-3 p-3 rounded-lg border-2 bg-green-50 border-green-200">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-600">{fileName}</p>
            <p className="text-xs text-green-600 opacity-80">
              ✓ {receipt.merchant || 'Receipt'} - ${receipt.amount || '0.00'}
            </p>
          </div>
          {receipt.category && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Store className="w-3 h-3" />
              <span>{receipt.category}</span>
            </div>
          )}
        </div>
      )
    }

    if (receipt.ocrError) {
      return (
        <div className="flex items-center gap-3 p-3 rounded-lg border-2 bg-red-50 border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-600">{fileName}</p>
            <p className="text-xs text-red-600 opacity-80">OCR failed - manual entry needed</p>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border-2 bg-blue-50 border-blue-200">
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-600">{fileName}</p>
          <p className="text-xs text-blue-600 opacity-80">Processing OCR...</p>
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

  return (
    <Card>
      <Card.Header>
        <Card.Title className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Upload Receipts</span>
          {uploadedReceiptIds.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {uploadedReceiptIds.length} processing
            </span>
          )}
        </Card.Title>
      </Card.Header>
      
      <Card.Content className="space-y-6">
        {/* Upload Zone */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
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
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                <Upload className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Drop receipts here or click to browse
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Supports JPG, PNG, PDF files up to 10MB
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                🎯 Free OCR processing • Auto-categorization • Transaction creation
              </p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="w-4 h-4 mr-2" />
                Browse Files
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.setAttribute('capture', 'environment')
                    fileInputRef.current.click()
                  }
                }}
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
            </div>
          </div>
        </div>

        {/* ✅ OCR Status Display - Using RTK Query polling */}
        {uploadedReceiptIds.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4" />
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
            <h4 className="font-medium text-gray-900 dark:text-white">
              Files to Upload ({previewFiles.length})
            </h4>
            
            <div className="space-y-2">
              {previewFiles.map((fileObj) => (
                <div
                  key={fileObj.id}
                  className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {fileObj.preview ? (
                      <img
                        src={fileObj.preview}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-md flex items-center justify-center">
                        <FileText className="w-6 h-6 text-red-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {fileObj.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {formatFileSize(fileObj.size)}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => removeFile(fileObj.id)}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <Button
              onClick={uploadFiles}
              loading={isLoading}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload & Process OCR
            </Button>
          </div>
        )}

        {/* Upload Progress */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
              <span className="text-gray-600 dark:text-gray-400">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Recently Processed Receipts Summary */}
        {processedReceipts.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Recently Processed ({processedReceipts.length})
            </h4>
            <div className="space-y-1">
              {processedReceipts.slice(-3).map((receipt) => (
                <div key={receipt._id} className="text-sm text-green-700 flex items-center justify-between">
                  <span>{receipt.merchant || 'Receipt'}</span>
                  <span className="font-medium">${receipt.amount || '0.00'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card.Content>
    </Card>
  )
}
