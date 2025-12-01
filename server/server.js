import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import receiptRoutes from './routes/receiptRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import fcmRoutes from './routes/fcmRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import financialSummaryRoutes from './routes/financialSummaryRoutes.js';
import billReminderRoutes from './routes/billReminderRoutes.js'
import { startBillReminderJob } from './jobs/billReminderJob.js'


const app = express();
startBillReminderJob()

// CORS Configuration
const corsOptions = {
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Add this before express.json middleware for webhook
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import './controllers/googleAuthController.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/fcm', fcmRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/finance', financialSummaryRoutes);
app.use('/api/bills', billReminderRoutes);

import errorHandler from './Middleware/errorHandler.js';
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
