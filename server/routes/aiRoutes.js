import express from 'express';
import auth from '../Middleware/authMiddleware.js';
import { 
  chatWithAI, 
  getLatestInsight,
  getAIInsights,        // ✅ NEW
  getPersonalizedTips,  // ✅ NEW
  getPredictions        // ✅ NEW
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', auth, chatWithAI);
router.get('/insights/latest', auth, getLatestInsight);
router.get('/insights', auth, getAIInsights);           // ✅ ADD - Fixes 404 error
router.get('/tips', auth, getPersonalizedTips);        // ✅ ADD - Fixes 404 error  
router.post('/predictions', auth, getPredictions);     // ✅ ADD - Fixes 404 error

export default router;
