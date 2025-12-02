import express from 'express'
import multer from 'multer'
import auth from '../Middleware/authMiddleware.js'
import { storage } from '../config/cloudinary.js' // ✅ Import Cloudinary storage
import {
  uploadReceipt,
  getReceipts,
  getReceipt,
  deleteReceipt,
  processReceiptOCR,
  getReceiptStatus,
  reprocessReceipt
} from '../controllers/receiptController.js'

const router = express.Router()

// ✅ Use Cloudinary storage instead of local disk storage
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

router.post('/upload', auth, upload.single('receipt'), uploadReceipt)
router.get('/', auth, getReceipts)
router.get('/:id', auth, getReceiptStatus)
router.delete('/:id', auth, deleteReceipt)
router.post('/:id/process', auth, processReceiptOCR)

export default router
