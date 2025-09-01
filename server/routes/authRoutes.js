import express from 'express';
import { body } from 'express-validator';
import { register, login, logout, verifyEmail, resendVerificationEmail } from '../controllers/authController.js';
import { googleAuth, googleAuthCallback } from '../controllers/googleAuthController.js';
import auth from '../Middleware/authMiddleware.js';

const router = express.Router();

router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim().escape(),
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], login);

router.post('/logout', logout);

router.post('/verify', auth, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Token is valid',
    user: req.user 
  });
});

router.post('/verify-email', [
  body('email').isEmail().normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 }).isNumeric(),
], verifyEmail);

router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail(),
], resendVerificationEmail);

export default router;
