import express from 'express';
import { createSubscriptionSession, stripeWebhook } from '../controllers/stripeController.js';

const router = express.Router();

router.post('/create-subscription-session', createSubscriptionSession);

// Stripe webhook endpoint (must use raw body)
router.post('/webhook', stripeWebhook);

export default router;
