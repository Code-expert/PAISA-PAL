import express from 'express';
import auth from '../Middleware/authMiddleware.js';
import { 
  chatWithAI, 
  getLatestInsight,
  getAIInsights,
  getPersonalizedTips,
  getPredictions,
  generateMonthlyReport
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', auth, chatWithAI);
router.get('/insights/latest', auth, getLatestInsight);
router.get('/insights', auth, getAIInsights);
router.get('/tips', auth, getPersonalizedTips);
router.get('/predictions', auth, getPredictions);
router.get('/report', auth, generateMonthlyReport);

export default router;
