import express from 'express';
import auth from '../Middleware/authMiddleware.js';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionController.js';

const router = express.Router();

router.get('/', auth, getTransactions);
router.post('/', auth, createTransaction);
router.put('/:id', auth, updateTransaction);
router.delete('/:id', auth, deleteTransaction);

export default router; 