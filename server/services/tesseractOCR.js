import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const cleanJSONResponse = (text) => {
  return text.replace(/``````\n?/g, '').trim();
};

export const preprocessImage = async (imagePath) => {
  const processedPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '_processed.jpg');
  
  await sharp(imagePath)
    .greyscale()
    .normalize()
    .sharpen()
    .resize(2000, 2000, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .toFile(processedPath);
  
  return processedPath;
};

export const extractTextFromImage = async (imagePath) => {
  try {
    console.log('📝 Extracting text from:', imagePath);
    console.log('🖼️ Preprocessing image...');
    const processedPath = await preprocessImage(imagePath);
    
    console.log('📝 Running Tesseract OCR...');
    const { data: { text, confidence } } = await Tesseract.recognize(
      processedPath,
      'eng',
      {
        logger: m => console.log(`Tesseract: ${m.status} - ${m.progress * 100}%`)
      }
    );
    
    if (fs.existsSync(processedPath)) {
      fs.unlinkSync(processedPath);
    }
    
    console.log(`✅ OCR completed with ${Math.round(confidence)}% confidence`);
    return text;
    
  } catch (error) {
    console.error('❌ Tesseract OCR failed:', error);
    throw new Error(`OCR extraction failed: ${error.message}`);
  }
};

export const parseWithGemini = async (ocrText) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `You are a receipt parser. Extract information from this OCR text.

Receipt Text:
"""
${ocrText}
"""

IMPORTANT: Return ONLY valid JSON, no markdown code blocks, no explanations.

Required JSON format:
{
  "merchant": "exact store name from receipt",
  "amount": 12.34,
  "date": "2025-10-21",
  "category": "Food & Dining",
  "confidence": 0.85
}

Categories (choose one): Food & Dining, Shopping, Transportation, Entertainment, Healthcare, Utilities, Other

If you cannot extract a field:
- merchant: use "Unknown Merchant"
- amount: use 0
- date: use today's date
- category: use "Other"
- confidence: 0.3`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiReply = response.text();
    
    console.log('🤖 Raw Gemini response:', aiReply.substring(0, 100) + '...');
    
    const cleanJson = cleanJSONResponse(aiReply);
    
    const parsed = JSON.parse(cleanJson);
    console.log('✅ Gemini parsed receipt:', parsed);
    
    return parsed;
    
  } catch (error) {
    console.error('❌ Gemini parsing failed:', error);
    console.error('Error details:', error.message);
    return null;
  }
};

export const parseReceiptData = async (extractedText) => {
  console.log('🔍 Parsing receipt data...');
  
  try {
    const geminiResult = await parseWithGemini(extractedText);
    
    if (geminiResult && geminiResult.merchant && geminiResult.merchant !== 'Unknown Merchant') {
      console.log('✅ Using Gemini parsing result');
      return {
        merchant: geminiResult.merchant || 'Unknown Merchant',
        amount: parseFloat(geminiResult.amount) || 0,
        date: geminiResult.date ? new Date(geminiResult.date) : new Date(),
        category: geminiResult.category || 'Other',
        extractedText: extractedText,
        confidence: geminiResult.confidence || 0.7,
        parsedWith: 'gemini'
      };
    }
    
    throw new Error('Gemini returned invalid data');
    
  } catch (error) {
    console.log('⚠️ Gemini failed, using regex parsing...');
    return parseReceiptWithRegex(extractedText);
  }
};

const parseReceiptWithRegex = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let merchant = 'Unknown Merchant';
  for (const line of lines) {
    if (line.length > 3 && /[a-zA-Z]/.test(line)) {
      merchant = line.substring(0, 50); // Limit length
      break;
    }
  }
  
  const amountPatterns = [
    /(?:₹|Rs\.?|INR)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
    /Total[:\s]+(?:₹|Rs\.?)?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
    /Amount[:\s]+(?:₹|Rs\.?)?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
    /Grand\s+Total[:\s]+(?:₹|Rs\.?)?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
    /\b(\d+(?:,\d+)*\.\d{2})\b/ // Any decimal number as last resort
  ];
  
  let amount = 0;
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      const cleanAmount = match[1].replace(/,/g, '');
      const parsedAmount = parseFloat(cleanAmount);
      if (!isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount < 1000000) {
        amount = parsedAmount;
        console.log(`💰 Found amount: ${amount} (pattern: ${pattern})`);
        break;
      }
    }
  }
  
  // Extract date
  const datePatterns = [
    /(\d{2}[-/]\d{2}[-/]\d{4})/,
    /(\d{4}[-/]\d{2}[-/]\d{2})/,
    /(\d{2}\s+[A-Za-z]{3}\s+\d{4})/
  ];
  
  let date = new Date();
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const parsedDate = new Date(match[1]);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate;
        break;
      }
    }
  }
  
  // Categorize based on keywords
  const category = categorizeReceipt(text);
  
  const confidence = amount > 0 ? 0.6 : 0.3;
  
  console.log('📊 OCR Results:', {
    merchant,
    amount,
    category,
    confidence
  });
  
  return {
    merchant,
    amount,
    date,
    category,
    extractedText: text,
    confidence,
    parsedWith: 'regex'
  };
};

// ✅ Smart categorization
const categorizeReceipt = (text) => {
  const lowerText = text.toLowerCase();
  
  const categories = {
    'Food & Dining': ['restaurant', 'cafe', 'coffee', 'food', 'pizza', 'burger', 'swiggy', 'zomato', 'hotel', 'dining', 'bakery', 'bar', 'pub'],
    'Shopping': ['mall', 'store', 'shop', 'amazon', 'flipkart', 'retail', 'mart', 'supermarket', 'grocery'],
    'Transportation': ['uber', 'ola', 'taxi', 'fuel', 'petrol', 'diesel', 'metro', 'bus', 'train', 'parking'],
    'Entertainment': ['movie', 'cinema', 'bookmyshow', 'netflix', 'spotify', 'theatre', 'game', 'concert'],
    'Healthcare': ['hospital', 'pharmacy', 'doctor', 'clinic', 'medicine', 'medical', 'health', 'diagnostic'],
    'Utilities': ['electricity', 'water', 'internet', 'mobile', 'recharge', 'broadband', 'wifi', 'gas']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      console.log(`📂 Categorized as: ${category}`);
      return category;
    }
  }
  
  return 'Other';
};

// ✅ Image validation
export const validateImage = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error('Image file not found');
  }
  
  const stats = fs.statSync(filePath);
  if (stats.size > 10 * 1024 * 1024) {
    throw new Error('Image file too large (max 10MB)');
  }
  
  const validExtensions = ['.jpg', '.jpeg', '.png'];
  const ext = path.extname(filePath).toLowerCase();
  if (!validExtensions.includes(ext)) {
    throw new Error('Invalid image format (only JPG, PNG allowed)');
  }
};
