import express from 'express';
import auth from '../Middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/multerMiddleware.js';
import { uploadReceipt } from '../controllers/receiptController.js';

const router = express.Router();

router.post('/upload', auth, uploadSingle('image'), uploadReceipt);

export default router;