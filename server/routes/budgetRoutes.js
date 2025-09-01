import express from 'express';
import auth from '../Middleware/authMiddleware.js';
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
} from '../controllers/budgetController.js';

const router = express.Router();

router.get('/', auth, getBudgets);
router.post('/', auth, createBudget);
router.put('/:id', auth, updateBudget);
router.delete('/:id', auth, deleteBudget);

export default router;
