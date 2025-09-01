import Receipt from '../models/Receipt.js';
import catchAsync from '../middleware/catchAsync.js';
import { v1 as uuidv1 } from 'uuid';
import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_VISION_KEY
});

const parseAmount = (text) => {
  const match = text.match(/\b\d{1,3}(,\d{3})*(\.\d{2})?\b/g);
  if (match) {
    // Return the largest number as the likely amount
    return match.map(s => Number(s.replace(/,/g, ''))).sort((a, b) => b - a)[0];
  }
  return null;
};

export const uploadReceipt = catchAsync(async (req, res) => {
  const imagePath = req.file.path;
  const [result] = await client.textDetection(imagePath);
  const ocrText = result.fullTextAnnotation ? result.fullTextAnnotation.text : '';
  const amount = parseAmount(ocrText);
  const receipt = await Receipt.create({
    user: req.user.id,
    imagePath,
    ocrText,
  });
  res.status(201).json({
    success: true,
    data: {
      receipt,
      ocrText,
      amount,
      createTransactionLink: `/transactions/new?amount=${amount || ''}&desc=Receipt`
    }
  });
}); 