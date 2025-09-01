import express from 'express';
import auth from '../Middleware/authMiddleware.js';
import { saveFcmToken, deleteFcmToken } from '../controllers/fcmController.js';

const router = express.Router();

router.post('/save', auth, saveFcmToken);
router.post('/delete', auth, deleteFcmToken);

export default router; 