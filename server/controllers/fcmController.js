import FcmToken from '../models/FcmToken.js';
import catchAsync from '../Middleware/catchAsync.js';

export const saveFcmToken = catchAsync(async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, message: 'Token required' });
  await FcmToken.updateOne(
    { user: req.user.id, token },
    { user: req.user.id, token },
    { upsert: true }
  );
  res.json({ success: true });
});

export const deleteFcmToken = catchAsync(async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, message: 'Token required' });
  await FcmToken.deleteOne({ user: req.user.id, token });
  res.json({ success: true });
}); 