import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import catchAsync from '../middleware/catchAsync.js';
import { generateVerificationCode, generateCodeExpiry } from '../utils/generateVerificationToken.js';
import { getVerificationEmailTemplate, getWelcomeEmailTemplate } from '../utils/emailTemplates.js';

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ✅ SIMPLIFIED: Only handle email/password registration
export const register = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { password, name, email, phone, location, dob, occupation, income, goals } = req.body;

  // Must have name, email, and password for regular registration
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required.'
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email.'
    });
  }

  // Create regular user (needs email verification)
  const userData = {
    name,
    email,
    password: await bcrypt.hash(password, 10),
    phone,
    location,
    dob,
    occupation,
    income,
    goals,
    isEmailVerified: false, // Regular users need verification
    emailVerificationCode: generateVerificationCode(),
    emailVerificationCodeExpires: generateCodeExpiry()
  };

  const user = new User(userData);
  await user.save();

  // Send verification email for regular users
  if (process.env.EMAIL_NOTIF === 'true') {
    try {
      const { text, html } = getVerificationEmailTemplate(user.name, user.emailVerificationCode);
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email - PaisaPal',
        text,
        html,
      });
      console.log(`Verification email sent to ${user.email} with code: ${user.emailVerificationCode}`);
    } catch (error) {
      console.log(`Failed to send email: ${error.message}`);
    }
  }

  const token = generateToken(user);
  const userObj = user.toObject();
  delete userObj.password;

  res.status(201).json({
    success: true,
    token,
    user: userObj,
    requiresEmailVerification: true // Always true for regular registration
  });
});

// ✅ SIMPLIFIED: Only handle email/password login
export const login = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.'
    });
  }

  const user = await User.findOne({ email });
  if (!user || !user.password) {
    return res.status(400).json({
      success: false,
      message: 'Invalid credentials.'
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Invalid credentials.'
    });
  }

  // Check email verification for regular users (skip for Google users)
  // if (!user.isEmailVerified && !user.googleId) {
  //   return res.status(401).json({
  //     success: false,
  //     message: 'Please verify your email first',
  //     requiresEmailVerification: true,
  //     email: user.email
  //   });
  // }

  const token = generateToken(user);
  const userObj = user.toObject();
  delete userObj.password;

  res.json({
    success: true,
    token,
    user: userObj
  });
});

// Rest of your functions remain the same...
export const logout = catchAsync(async (req, res) => {
  res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

export const verifyEmail = catchAsync(async (req, res) => {
  const { code, email } = req.body;

  if (!code || !email) {
    return res.status(400).json({
      success: false,
      message: 'Verification code and email are required'
    });
  }

  const user = await User.findOne({
    email,
    emailVerificationCode: code,
    emailVerificationCodeExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification code'
    });
  }

  user.isEmailVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationCodeExpires = undefined;
  await user.save();

  if (process.env.EMAIL_NOTIF === 'true') {
    try {
      const { text, html } = getWelcomeEmailTemplate(user.name);
      await sendEmail({
        to: user.email,
        subject: 'Welcome to PaisaPal!',
        text,
        html,
      });
      console.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      console.log(`Failed to send welcome email: ${error.message}`);
    }
  }

  res.json({
    success: true,
    message: 'Email verified successfully! You can now log in.'
  });
});

export const resendVerificationEmail = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: 'Email is already verified'
    });
  }

  user.emailVerificationCode = generateVerificationCode();
  user.emailVerificationCodeExpires = generateCodeExpiry();
  await user.save();

  if (process.env.EMAIL_NOTIF === 'true') {
    try {
      const { text, html } = getVerificationEmailTemplate(user.name, user.emailVerificationCode);
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email - PaisaPal',
        text,
        html,
      });
      console.log(`Verification email resent to ${user.email} with code: ${user.emailVerificationCode}`);
    } catch (error) {
      console.log(`Failed to send verification email: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }
  }

  res.json({
    success: true,
    message: 'Verification email sent successfully'
  });
});
