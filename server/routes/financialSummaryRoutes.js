import express from 'express';
import { getFinancialSummary, upsertFinancialSummary } from '../controllers/financialSummaryController.js';
import isAuthenticated from '../Middleware/authMiddleware.js';

const router = express.Router();

// GET /api/finance/summary - get current user's summary
router.get('/summary', isAuthenticated, getFinancialSummary);

// POST /api/finance/summary - create or update current user's summary
router.post('/summary', isAuthenticated, upsertFinancialSummary);

export default router; 