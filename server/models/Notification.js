import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error', 'goal', 'reminder', 'investment'],
    default: 'info',
  },
  isRead: { type: Boolean, default: false },
  actionLink: { type: String },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema); 