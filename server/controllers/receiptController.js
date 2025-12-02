import Receipt from '../models/Receipt.js'
import Transaction from '../models/Transaction.js'
import Budget from '../models/Budget.js'
import catchAsync from '../middleware/catchAsync.js'
import { extractTextFromImage, parseReceiptData } from '../services/tesseractOCR.js'
import { cloudinary } from '../config/cloudinary.js'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ✅ Upload receipt to Cloudinary
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
    mimetype: req.file.mimetype,
    cloudinaryUrl: req.file.path // Cloudinary URL
  })

  // Create initial receipt record
  const receipt = await Receipt.create({
    user: req.user.id,
    filename: req.file.originalname,
    fileUrl: req.file.path, // ✅ Cloudinary URL
    cloudinaryId: req.file.filename, // ✅ Cloudinary public ID
    fileType: req.file.mimetype,
    fileSize: req.file.size,
    ocrProcessed: false,
    processed: false
  })

  console.log('✅ Receipt record created:', receipt._id)

  // Process OCR in background
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

// ✅ Updated OCR processing to download from Cloudinary
export const processReceiptOCR = async (receiptId, userId) => {
  let tempFilePath = null
  
  try {
    console.log('🔄 Starting background OCR for receipt:', receiptId)
    
    const receipt = await Receipt.findById(receiptId)
    if (!receipt) {
      throw new Error('Receipt not found')
    }

    // ✅ Download image from Cloudinary to temp folder for OCR
    const tempDir = path.join(__dirname, '../temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    tempFilePath = path.join(tempDir, `${receiptId}.jpg`)
    
    console.log('📥 Downloading image from Cloudinary:', receipt.fileUrl)
    const response = await axios({
      method: 'GET',
      url: receipt.fileUrl,
      responseType: 'stream'
    })

    const writer = fs.createWriteStream(tempFilePath)
    response.data.pipe(writer)

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })

    console.log('📝 Extracting text from:', tempFilePath)
    const extractedText = await extractTextFromImage(tempFilePath)

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
        await Receipt.findByIdAndUpdate(receiptId, {
          linkedTransaction: transaction._id
        })
        await updateBudgetFromTransaction(transaction)
        console.log('💰 Auto-created transaction:', transaction._id)
      }
    }

    // ✅ Clean up temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath)
      console.log('🗑️ Cleaned up temp file')
    }

  } catch (error) {
    console.error('❌ OCR processing failed:', error)
    
    // Clean up temp file on error
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath)
    }

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
      date: ocrData.date || new Date(),
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

// Get all receipts
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

// Get single receipt
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

// ✅ Delete receipt from both DB and Cloudinary
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

  // Delete from Cloudinary
  if (receipt.cloudinaryId) {
    try {
      await cloudinary.uploader.destroy(receipt.cloudinaryId)
      console.log('☁️ Deleted from Cloudinary:', receipt.cloudinaryId)
    } catch (error) {
      console.error('❌ Failed to delete from Cloudinary:', error)
    }
  }

  // Delete linked transaction if exists
  if (receipt.linkedTransaction) {
    await Transaction.findByIdAndDelete(receipt.linkedTransaction)
  }

  // Delete receipt from DB
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

// Get receipt status
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
