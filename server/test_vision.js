import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import { processReceiptImage } from './services/visionService.js';

const imagePath = 'C:\\Users\\asing\\.gemini\\antigravity\\brain\\ec766f1d-b5c8-4599-835b-886f15f6163e\\test_receipt_1781014543014.png';

async function runTest() {
  console.log("🚀 Testing Gemini Vision OCR...");
  console.log("File:", imagePath);
  
  try {
    const result = await processReceiptImage(imagePath);
    console.log("\n✅ FINAL OCR OUTPUT:");
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

runTest();
