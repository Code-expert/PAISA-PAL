import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'  // ← Add this import
import { fileURLToPath } from 'url'
import auth from '../Middleware/authMiddleware.js'
import {
  uploadReceipt,
  getReceipts,
  deleteReceipt,
  processReceiptOCR,
  getReceiptStatus , // ← Add this import
  reprocessReceipt   // ← And this (you already have it)  

} from '../controllers/receiptController.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ✅ ENHANCED: Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/receipts/')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
  console.log('📁 Created uploads directory:', uploadDir)
}

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)  // ← Use the verified directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only images and PDFs allowed!'), false)
    }
  }
})

const router = express.Router()

router.post('/upload', auth, upload.single('receipt'), uploadReceipt)
router.get('/', auth, getReceipts)
router.get('/:id', auth, getReceiptStatus) 
router.delete('/:id', auth, deleteReceipt)
router.post('/:id/process', auth, processReceiptOCR)
router.get('/:id', auth, getReceiptStatus)


export default router
