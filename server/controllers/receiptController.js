// backend/controllers/receiptController.js
import Receipt from '../models/Receipt.js'
import Transaction from '../models/Transaction.js' 
import Budget from '../models/Budget.js'
import catchAsync from '../middleware/catchAsync.js'
import { extractTextFromImage, parseReceiptData, validateImage } from '../services/tesseractOCR.js'

// Upload and process receipt with FREE Tesseract OCR
export const uploadReceipt = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    })
  }

  console.log('📤 Processing receipt upload for user:', req.user.id)
  console.log('📁 File details:', {
    originalname: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype
  })

  // Create initial receipt record
  const receipt = await Receipt.create({
    user: req.user.id,
    filename: req.file.originalname,
    fileUrl: `/uploads/receipts/${req.file.filename}`,
    filePath: req.file.path,
    fileType: req.file.mimetype,
    fileSize: req.file.size,
    ocrProcessed: false,
    processed: false
  })

  console.log('✅ Receipt record created:', receipt._id)

  // Process OCR in background (don't block response)
  processReceiptOCR(receipt._id, req.user.id)
    .then(() => {
      console.log('🎉 Background OCR processing completed for:', receipt._id)
    })
    .catch(error => {
      console.error('❌ Background OCR processing failed:', error)
    })

  return res.status(201).json({
    success: true,
    message: 'Receipt uploaded successfully. OCR processing in progress...',
    data: {
      receipt: {
        id: receipt._id,
        filename: receipt.filename,
        fileUrl: receipt.fileUrl,
        uploadDate: receipt.uploadDate,
        processed: false,
        ocrProcessed: false
      }
    }
  })
})

// Background OCR processing function
export const processReceiptOCR = async (receiptId, userId) => {
  try {
    console.log('🔄 Starting background OCR for receipt:', receiptId)
    
    const receipt = await Receipt.findById(receiptId)
    if (!receipt) {
      throw new Error('Receipt not found')
    }

    // Validate image before processing
    validateImage(receipt.filePath)
    
    // Extract text using Tesseract OCR (FREE!)
    console.log('📝 Extracting text from:', receipt.filePath)
    const extractedText = await extractTextFromImage(receipt.filePath)
    
    // Parse receipt data
    const ocrData = await parseReceiptData(extractedText)
    
    console.log('📊 OCR Results:', {
      merchant: ocrData.merchant,
      amount: ocrData.amount,
      category: ocrData.category,
      confidence: ocrData.confidence
    })

    // Update receipt with OCR data
    await Receipt.findByIdAndUpdate(receiptId, {
      amount: ocrData.amount,
      merchant: ocrData.merchant,
      extractedText: ocrData.extractedText,
      category: ocrData.category,
      processed: true,
      ocrProcessed: true,
      ocrError: null,
      confidence: ocrData.confidence
    })

    // Auto-create transaction if amount is reasonable
    if (ocrData.amount > 0 && ocrData.amount < 10000) {
      const transaction = await createTransactionFromReceipt(ocrData, userId, receiptId)
      
      if (transaction) {
        // Link transaction to receipt
        await Receipt.findByIdAndUpdate(receiptId, {
          linkedTransaction: transaction._id
        })
        
        // Update budget
        await updateBudgetFromTransaction(transaction)
        
        console.log('💰 Auto-created transaction:', transaction._id)
      }
    }

  } catch (error) {
    console.error('❌ OCR processing failed:', error)
    
    // Update receipt with error
    await Receipt.findByIdAndUpdate(receiptId, {
      processed: false,
      ocrProcessed: false,
      ocrError: error.message
    })
  }
}

// Helper function to create transaction from OCR data
const createTransactionFromReceipt = async (ocrData, userId, receiptId) => {
  try {
    const transaction = await Transaction.create({
      user: userId,
      amount: ocrData.amount,
      category: ocrData.category,
      type: 'expense',
      description: `${ocrData.merchant} - Auto-created from receipt`,
      date: ocrData.date,
      receiptId: receiptId,
      source: 'receipt_ocr'
    })

    return transaction
    
  } catch (error) {
    console.error('❌ Failed to create transaction:', error)
    return null
  }
}

// Helper function to update budget
const updateBudgetFromTransaction = async (transaction) => {
  try {
    const currentMonth = new Date(transaction.date.getFullYear(), transaction.date.getMonth(), 1)
    const nextMonth = new Date(transaction.date.getFullYear(), transaction.date.getMonth() + 1, 0)

    const budget = await Budget.findOne({
      user: transaction.user,
      category: transaction.category,
      createdAt: { $gte: currentMonth, $lte: nextMonth }
    })

    if (budget) {
      budget.actual = (budget.actual || 0) + transaction.amount
      await budget.save()
      console.log('📊 Updated budget for', transaction.category)
    }

  } catch (error) {
    console.error('❌ Failed to update budget:', error)
  }
}

// Get all receipts with OCR data
export const getReceipts = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, category, processed } = req.query

  const filter = { user: req.user.id }
  if (category && category !== 'all') filter.category = category
  if (processed !== undefined) filter.processed = processed === 'true'

  const receipts = await Receipt.find(filter)
    .populate('linkedTransaction')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)

  const total = await Receipt.countDocuments(filter)

  res.status(200).json({
    success: true,
    data: {
      receipts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }
  })
})

// Get single receipt with details
export const getReceipt = catchAsync(async (req, res) => {
  const receipt = await Receipt.findOne({
    _id: req.params.id,
    user: req.user.id
  }).populate('linkedTransaction')

  if (!receipt) {
    return res.status(404).json({
      success: false,
      message: 'Receipt not found'
    })
  }

  res.status(200).json({
    success: true,
    data: { receipt }
  })
})

// Delete receipt and linked transaction
export const deleteReceipt = catchAsync(async (req, res) => {
  const receipt = await Receipt.findOne({
    _id: req.params.id,
    user: req.user.id
  })

  if (!receipt) {
    return res.status(404).json({
      success: false,
      message: 'Receipt not found'
    })
  }

  // Delete linked transaction if exists
  if (receipt.linkedTransaction) {
    await Transaction.findByIdAndDelete(receipt.linkedTransaction)
  }

  // Delete receipt
  await Receipt.findByIdAndDelete(req.params.id)

  res.status(200).json({
    success: true,
    message: 'Receipt deleted successfully'
  })
})

// Reprocess receipt OCR
export const reprocessReceipt = catchAsync(async (req, res) => {
  const receipt = await Receipt.findOne({
    _id: req.params.id,
    user: req.user.id
  })

  if (!receipt) {
    return res.status(404).json({
      success: false,
      message: 'Receipt not found'
    })
  }

  // Start reprocessing
  processReceiptOCR(receipt._id, req.user.id)
    .then(() => {
      console.log('🔄 Receipt reprocessing completed')
    })
    .catch(error => {
      console.error('❌ Receipt reprocessing failed:', error)
    })

  res.status(200).json({
    success: true,
    message: 'Receipt reprocessing started'
  })
})
// Add this export function to your receiptController.js


// Add this export function to your receiptController.js
export const getReceiptStatus = catchAsync(async (req, res) => {
  const receipt = await Receipt.findOne({
    _id: req.params.id,
    user: req.user.id
  }).populate('linkedTransaction')

  if (!receipt) {
    return res.status(404).json({
      success: false,
      message: 'Receipt not found'
    })
  }

  res.status(200).json({
    success: true,
    data: { receipt }
  })
})
