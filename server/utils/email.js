import nodemailer from 'nodemailer';
import crypto from 'crypto';
import sendEmail from './sendEmail.js';

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (user) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  user.verificationCode = code;
  user.verificationExpires = expires;
  await user.save();

  await sendEmail(
    user.email,
    'Your Verification Code',
    `<p>Your verification code is: <b>${code}</b></p>`
  );
};
