import express from 'express';
import { param } from 'express-validator';
import auth from '../Middleware/authMiddleware.js';
import { getNotifications, markAsRead, createNotification } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', auth, getNotifications);
router.put('/:id/read', auth, [param('id').isMongoId()], markAsRead);
router.post('/', auth, createNotification);

export default router; 