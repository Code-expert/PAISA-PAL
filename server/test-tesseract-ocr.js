// test-tesseract-ocr.js
import { extractTextFromImage, parseReceiptData, validateImage } from './services/tesseractOCR.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 🧪 Test the complete free OCR pipeline
async function testTesseractOCR() {
  try {
    console.log('🧪 Testing Free Tesseract OCR Pipeline')
    console.log('=' .repeat(60))
    
    // Check if test image exists
    const testImagePath = path.join(__dirname, 'test-receipt.jpg')
    
    if (!fs.existsSync(testImagePath)) {
      console.log('⚠️  No test image found. Creating instructions...')
      console.log('\n📸 To test OCR:')
      console.log('1. Take a photo of any receipt')
      console.log('2. Save it as "test-receipt.jpg" in your server root directory')
      console.log('3. Run this test again: node test-tesseract-ocr.js')
      console.log('\n💡 Or download a sample receipt image online')
      return
    }

    console.log('✅ Test image found:', testImagePath)
    console.log('📁 File size:', Math.round(fs.statSync(testImagePath).size / 1024), 'KB')
    
    // Step 1: Validate image
    console.log('\n🔍 Step 1: Validating image...')
    try {
      validateImage(testImagePath)
      console.log('✅ Image validation passed')
    } catch (error) {
      console.log('❌ Image validation failed:', error.message)
      return
    }

    // Step 2: Extract text with timing
    console.log('\n📝 Step 2: Extracting text with Tesseract OCR...')
    const startTime = Date.now()
    
    const extractedText = await extractTextFromImage(testImagePath)
    
    const endTime = Date.now()
    const processingTime = (endTime - startTime) / 1000
    
    console.log(`⏱️  Processing completed in ${processingTime} seconds`)
    console.log(`📄 Extracted ${extractedText.length} characters`)
    
    // Display raw OCR text
    console.log('\n📃 Raw OCR Text:')
    console.log('─'.repeat(50))
    console.log(extractedText)
    console.log('─'.repeat(50))

    // Step 3: Parse receipt data
    console.log('\n🔍 Step 3: Parsing receipt data...')
    const parsedData = parseReceiptData(extractedText)
    
    console.log('📊 Parsed Results:')
    console.log('─'.repeat(30))
    console.table({
      'Merchant': parsedData.merchant,
      'Amount': `$${parsedData.amount}`,
      'Date': parsedData.date.toLocaleDateString(),
      'Category': parsedData.category,
      'Confidence': parsedData.confidence
    })

    // Step 4: Analyze results
    console.log('\n📈 Analysis:')
    analyzeResults(parsedData, extractedText, processingTime)
    
    // Step 5: Performance comparison
    console.log('\n⚡ Performance Summary:')
    console.log(`🕐 Processing Time: ${processingTime}s (Google Vision: ~1-2s)`)
    console.log(`🎯 Text Length: ${extractedText.length} characters`)
    console.log(`💡 Accuracy: ${getAccuracyEstimate(parsedData)} (estimated)`)
    
    console.log('\n🎉 Tesseract OCR test completed successfully!')
    
  } catch (error) {
    console.error('\n❌ OCR Test Failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Make sure tesseract.js is installed: npm install tesseract.js')
    console.log('2. Check if test-receipt.jpg exists in server root')
    console.log('3. Ensure image is clear and well-lit') 
    console.log('4. Try with a different receipt image')
  }
}

// 📊 Analyze OCR results quality
function analyzeResults(parsedData, extractedText, processingTime) {
  const analysis = []
  
  // Check amount detection
  if (parsedData.amount > 0) {
    analysis.push('✅ Amount detected successfully')
  } else {
    analysis.push('⚠️  Amount not detected (may need clearer image)')
  }
  
  // Check merchant detection
  if (parsedData.merchant && parsedData.merchant !== 'Unknown Merchant') {
    analysis.push('✅ Merchant identified')
  } else {
    analysis.push('⚠️  Merchant not clearly identified')
  }
  
  // Check category assignment
  if (parsedData.category && parsedData.category !== 'Other') {
    analysis.push('✅ Category auto-assigned')
  } else {
    analysis.push('💡 Category defaulted to "Other"')
  }
  
  // Check text quality
  if (extractedText.length > 50) {
    analysis.push('✅ Good text extraction')
  } else {
    analysis.push('⚠️  Limited text extracted (image quality?)')
  }
  
  // Performance assessment
  if (processingTime < 10) {
    analysis.push('✅ Good processing speed')
  } else {
    analysis.push('⏱️  Slower processing (expected with Tesseract)')
  }
  
  analysis.forEach(item => console.log(item))
}

// 🎯 Estimate accuracy based on results
function getAccuracyEstimate(parsedData) {
  let score = 0
  let total = 0
  
  // Amount accuracy
  total++
  if (parsedData.amount > 0) score++
  
  // Merchant accuracy  
  total++
  if (parsedData.merchant !== 'Unknown Merchant') score++
  
  // Category accuracy
  total++
  if (parsedData.category !== 'Other') score++
  
  const percentage = Math.round((score / total) * 100)
  
  if (percentage >= 80) return `${percentage}% (Excellent)`
  if (percentage >= 60) return `${percentage}% (Good)`
  if (percentage >= 40) return `${percentage}% (Fair)`
  return `${percentage}% (Poor - try clearer image)`
}

// 🎯 Performance comparison test
async function performanceTest() {
  console.log('\n⚡ Running Performance Test...')
  
  const testImagePath = path.join(__dirname, 'test-receipt.jpg')
  if (!fs.existsSync(testImagePath)) {
    console.log('❌ No test image for performance test')
    return
  }
  
  const iterations = 3
  const times = []
  
  for (let i = 1; i <= iterations; i++) {
    console.log(`🔄 Test ${i}/${iterations}...`)
    const start = Date.now()
    
    try {
      await extractTextFromImage(testImagePath)
      const time = (Date.now() - start) / 1000
      times.push(time)
      console.log(`   ⏱️  ${time}s`)
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`)
    }
  }
  
  if (times.length > 0) {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length
    console.log(`📊 Average time: ${avgTime.toFixed(2)}s`)
    console.log(`📈 Range: ${Math.min(...times).toFixed(2)}s - ${Math.max(...times).toFixed(2)}s`)
  }
}

// 🧪 Test different image qualities
async function imageQualityTest() {
  console.log('\n📸 Image Quality Guidelines:')
  console.log('✅ GOOD: Clear, well-lit, straight receipt')
  console.log('⚠️  FAIR: Slightly blurry or angled receipt')  
  console.log('❌ POOR: Dark, very blurry, or crumpled receipt')
  console.log('')
  console.log('💡 Tips for better OCR results:')
  console.log('• Take photos in good lighting')
  console.log('• Keep receipt flat and straight')
  console.log('• Avoid shadows and glare')
  console.log('• Use high resolution (but under 10MB)')
  console.log('• Ensure text is clearly visible')
}

// Run the tests
console.log('🚀 Starting Free OCR Testing Suite...\n')

testTesseractOCR()
  .then(() => {
    return performanceTest()
  })
  .then(() => {
    imageQualityTest()
    console.log('\n🎉 All tests completed!')
  })
  .catch(error => {
    console.error('💥 Test suite failed:', error)
  })
