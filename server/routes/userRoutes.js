import express from 'express';
import { body } from 'express-validator';
import { getProfile, updateProfile, uploadAvatar } from '../controllers/userController.js';
import auth from '../Middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/multerMiddleware.js';

const router = express.Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, [
  body('name').optional().notEmpty(),
  body('phone').optional().isMobilePhone(),
  body('email').optional().isEmail(),
], updateProfile);
router.put('/profile/avatar', auth, uploadSingle('avatar'), uploadAvatar);

export default router; 