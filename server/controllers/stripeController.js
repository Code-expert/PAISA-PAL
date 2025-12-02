import Stripe from 'stripe';
import catchAsync from '../Middleware/catchAsync.js';
import logger from '../utils/logger.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createSubscriptionSession = catchAsync(async (req, res) => {
  const { priceId, customerEmail } = req.body;
  
  // Validate required fields
  if (!priceId || !customerEmail) {
    return res.status(400).json({ 
      success: false, 
      message: 'Price ID and customer email are required' 
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid email format' 
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: customerEmail,
    success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/cancel`,
    metadata: {
      userId: req.user?.id || 'anonymous'
    }
  });
  
  logger.info('Stripe checkout session created', {
    sessionId: session.id,
    customerEmail,
    priceId,
    userId: req.user?.id
  });

  res.json({ 
    success: true, 
    url: session.url,
    sessionId: session.id
  });
});

export const createPaymentSession = catchAsync(async (req, res) => {
  const { amount, currency = 'usd', description } = req.body;
  
  // Validate required fields
  if (!amount || amount <= 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Valid amount is required' 
    });
  }
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: description || 'Paisa Pal Payment',
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-cancel`,
    metadata: {
      userId: req.user?.id || 'anonymous',
      amount: amount.toString(),
      description: description || 'Paisa Pal Payment'
    }
  });
  
  logger.info('Stripe payment session created', {
    sessionId: session.id,
    amount,
    currency,
    userId: req.user?.id
  });
  
  res.json({ 
    success: true, 
    url: session.url,
    sessionId: session.id
  });
});

export const stripeWebhook = (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error('Stripe webhook signature verification failed', {
      error: err.message,
      signature: sig
    });
    return res.status(400).json({ 
      success: false, 
      message: `Webhook Error: ${err.message}` 
    });
  }

  logger.info('Stripe webhook received', {
    eventType: event.type,
    eventId: event.id
  });

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
      logger.info('Subscription created', { subscription: event.data.object });
      // TODO: Update user subscription status in database
      break;
    case 'customer.subscription.updated':
      logger.info('Subscription updated', { subscription: event.data.object });
      // TODO: Update user subscription status in database
      break;
    case 'customer.subscription.deleted':
      logger.info('Subscription deleted', { subscription: event.data.object });
      // TODO: Update user subscription status in database
      break;
    case 'invoice.payment_succeeded':
      logger.info('Payment succeeded', { invoice: event.data.object });
      // TODO: Update payment status in database
      break;
    case 'invoice.payment_failed':
      logger.info('Payment failed', { invoice: event.data.object });
      // TODO: Handle failed payment (notify user, retry, etc.)
      break;
    case 'checkout.session.completed':
      logger.info('Checkout session completed', { session: event.data.object });
      // TODO: Fulfill the purchase (update user account, send confirmation email)
      break;
    default:
      logger.warn(`Unhandled event type: ${event.type}`);
  }

  res.json({ 
    success: true, 
    received: true 
  });
};

export const getPaymentStatus = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  
  if (!sessionId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Session ID is required' 
    });
  }
  
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.json({ 
      success: true, 
      status: session.payment_status,
      customerEmail: session.customer_email,
      amountTotal: session.amount_total,
      currency: session.currency
    });
  } catch (err) {
    logger.error('Error retrieving Stripe payment session', {
      error: err.message,
      sessionId
    });
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving Stripe payment session' 
    });
  }
});
