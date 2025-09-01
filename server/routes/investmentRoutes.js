import express from 'express';
import auth from '../Middleware/authMiddleware.js';
import { 
  getInvestments, 
  getInvestment,
  createInvestment, 
  updateInvestment, 
  deleteInvestment 
} from '../controllers/investmentController.js';

const router = express.Router();

router.get('/', auth, getInvestments);
router.get('/:id', auth, getInvestment);
router.post('/', auth, createInvestment);
router.put('/:id', auth, updateInvestment);
router.delete('/:id', auth, deleteInvestment);

export default router;
