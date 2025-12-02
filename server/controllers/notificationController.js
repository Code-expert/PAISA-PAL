import Notification from '../models/Notification.js';
import { validationResult } from 'express-validator';
import catchAsync from '../Middleware/catchAsync.js';
import pushNotification from '../utils/pushNotification.js';

export const getNotifications = catchAsync(async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: notifications });
});

export const markAsRead = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Invalid notification ID' });
  }
  const notif = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { isRead: true },
    { new: true }
  );
  if (!notif) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }
  res.json({ success: true, data: notif });
});

export const createNotification = catchAsync(async (req, res) => {
  const { user, title, message, type, actionLink } = req.body;
  if (!user || !title) {
    return res.status(400).json({ success: false, message: 'user and title are required' });
  }
  const notif = await pushNotification(user, title, message, type, actionLink);
  res.status(201).json({ success: true, data: notif });
}); 