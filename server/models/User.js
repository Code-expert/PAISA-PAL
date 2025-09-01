import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const { Schema, model } = mongoose;

const userSchema = new Schema({
  // Authentication
  googleId: { type: String, unique: true, sparse: true }, // For Google login
  password: { type: String }, // For local login (hashed)

  // Email Verification
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String },
  emailVerificationCodeExpires: { type: Date },

  // Basic Profile
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  photo: { type: String }, // Profile picture URL
  avatar: { type: String },
  role: { type: String, default: 'User' },

  // Optional Personal Data
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  dob: { type: Date },
  occupation: { type: String, default: '' },
  income: { type: Number, default: 0 },
  goals: { type: String, default: '' },

  // Financial Data Relationships
  transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction', default: [] }],
  budgets: [{ type: Schema.Types.ObjectId, ref: 'Budget', default: [] }],
  insights: [{ type: Schema.Types.ObjectId, ref: 'Insight', default: [] }],
}, {
  timestamps: true, // Automatically manages createdAt and updatedAt
});

// Generate JWT Token
userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    { 
      _id: this._id,
      email: this.email,
      role: this.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
  return token;
};

export default model('User', userSchema);
