import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

export const processReceiptImage = async (imagePath) => {
  try {
    console.log('🤖 Sending image to Gemini Vision API...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const generateWithRetry = async (prompt, imagePart, maxRetries = 3) => {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          return await model.generateContent([prompt, imagePart]);
        } catch (error) {
          const isRetryable = error.message?.includes('429') || error.message?.includes('503') || error.message?.includes('500');
          if (isRetryable && attempt < maxRetries - 1) {
            const delay = 3000 * Math.pow(2, attempt);
            console.log(`Vision API overloaded. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw error;
          }
        }
      }
    };

    const prompt = `You are an expert receipt analyzer. Analyze this image and extract the receipt details.
IMPORTANT: Return ONLY valid JSON, no markdown code blocks, no explanations.

Required JSON format:
{
  "merchant": "exact store name from receipt",
  "amount": 12.34,
  "date": "2025-10-21",
  "category": "food",
  "extractedText": "all raw text you see on the receipt (string)",
  "confidence": 0.95
}

Categories (choose one): food, shopping, transportation, entertainment, healthcare, utilities, other

If you cannot extract a field:
- merchant: use "Unknown Merchant"
- amount: use 0
- date: use today's date
- category: use "Other"
- confidence: 0.3`;

    // The image downloaded from Cloudinary by the controller is temporarily saved as .jpg
    const imagePart = fileToGenerativePart(imagePath, "image/jpeg");

    const result = await generateWithRetry(prompt, imagePart);
    const response = await result.response;
    const aiReply = response.text();

    console.log('🤖 Raw Gemini response received.');

    // Clean up potential markdown formatting
    const cleanJson = aiReply.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(cleanJson);
    console.log('✅ Gemini Vision parsed receipt:', parsed);

    return {
      merchant: parsed.merchant || 'Unknown Merchant',
      amount: parseFloat(parsed.amount) || 0,
      date: parsed.date ? new Date(parsed.date) : new Date(),
      category: parsed.category || 'other',
      extractedText: parsed.extractedText || '',
      confidence: parsed.confidence || 0.7,
      parsedWith: 'gemini-vision'
    };

  } catch (error) {
    console.error('❌ Gemini Vision parsing failed:', error);
    throw new Error('Gemini Vision OCR failed');
  }
};
