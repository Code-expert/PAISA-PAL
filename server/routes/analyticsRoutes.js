import express from 'express';
import auth from '../Middleware/authMiddleware.js';
import { getCategoryAnalytics, getMonthlyAnalytics, getBudgetVsActual } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/category', auth, getCategoryAnalytics);
router.get('/monthly', auth, getMonthlyAnalytics);
router.get('/budget-vs-actual', auth, getBudgetVsActual);

export default router; 