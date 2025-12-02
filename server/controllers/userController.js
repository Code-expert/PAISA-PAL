import { validationResult } from 'express-validator';
import User from '../models/User.js';
import catchAsync from '../Middleware/catchAsync.js';

export const getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json({ success: true, user });
});

export const updateProfile = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  
  const updates = {};
  ['name', 'phone', 'email'].forEach(field => {
    if (req.body[field]) updates[field] = req.body[field];
  });
  
  const user = await User.findByIdAndUpdate(
    req.user.id, 
    updates, 
    { new: true, runValidators: true }
  ).select('-password');
  
  res.json({ success: true, user });
}); 

export const uploadAvatar = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: req.file.path },
    { new: true, runValidators: true }
  ).select('-password');
  
  res.json({ success: true, user });
});