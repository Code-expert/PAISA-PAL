import crypto from 'crypto';

/**
 * Generate a 6-digit email verification code
 * @returns {string} - 6-digit numeric code
 */
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate verification code expiry date (15 minutes from now)
 * @returns {Date} - Expiry date
 */
export const generateCodeExpiry = () => {
  return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
};

export default { generateVerificationCode, generateCodeExpiry };
