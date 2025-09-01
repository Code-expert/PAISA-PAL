import mongoose from 'mongoose';

const insightSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{ role: String, content: String }],
  aiReply: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Insight', insightSchema); 