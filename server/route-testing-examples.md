# Paisa Pal API Testing Examples

## 🔥 PRIORITY: File Upload Routes (Recently Modified with Multer Middleware)

### 1. Avatar Upload Test
```http
PUT http://localhost:5000/api/users/profile/avatar
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

# Form data:
avatar: [SELECT IMAGE FILE]
```

**Test Cases:**
```javascript
// Test Case 1: Valid Image Upload
const formData = new FormData();
formData.append('avatar', imageFile); // JPG/PNG under 5MB

fetch('/api/users/profile/avatar', {
  method: 'PUT',
  headers: { 'Authorization': 'Bearer ' + token },
  body: formData
});

// Expected: 200 OK with updated user profile

// Test Case 2: Invalid File Type
formData.append('avatar', pdfFile); // Should fail
// Expected: 400 Bad Request - "Only image files are allowed!"

// Test Case 3: File Too Large
formData.append('avatar', largeImageFile); // >5MB
// Expected: 400 Bad Request - File size limit exceeded

// Test Case 4: Missing File
fetch('/api/users/profile/avatar', {
  method: 'PUT',
  headers: { 'Authorization': 'Bearer ' + token },
  body: new FormData() // Empty
});
// Expected: 400 Bad Request - No file uploaded
```

### 2. Receipt Upload Test
```http
POST http://localhost:5000/api/receipts/upload
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

# Form data:
image: [SELECT RECEIPT IMAGE]
```

**Test Cases:**
```javascript
// Test Case 1: Valid Receipt Upload
const formData = new FormData();
formData.append('image', receiptImage);

fetch('/api/receipts/upload', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token },
  body: formData
});

// Expected: 200 OK with OCR extracted data
// Response: { success: true, data: { amount: 25.99, merchant: "Starbucks", ... } }

// Test Case 2: Invalid File Format
formData.append('image', textFile);
// Expected: 400 Bad Request - "Only image files are allowed!"

// Test Case 3: Corrupted Image
formData.append('image', corruptedImage);
// Expected: 400 Bad Request or OCR processing error
```

---

## 🔐 Authentication Routes

### 1. User Registration
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}
```

### 2. User Login
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### 3. User Logout
```http
POST http://localhost:5000/api/auth/logout
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 👤 User Management Routes

### 1. Get User Profile
```http
GET http://localhost:5000/api/users/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

### 2. Update User Profile
```http
PUT http://localhost:5000/api/users/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+1987654321",
  "email": "john.updated@example.com"
}
```

---

## 💰 Transaction Routes

### 1. Get All Transactions
```http
GET http://localhost:5000/api/transactions
Authorization: Bearer YOUR_JWT_TOKEN

# Optional query parameters:
# ?page=1&limit=10&category=food&type=expense&startDate=2024-01-01&endDate=2024-12-31
```

### 2. Create Transaction
```http
POST http://localhost:5000/api/transactions
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "amount": 25.99,
  "description": "Coffee at Starbucks",
  "category": "food",
  "type": "expense",
  "date": "2024-01-15T10:30:00Z",
  "paymentMethod": "credit_card"
}
```

### 3. Update Transaction
```http
PUT http://localhost:5000/api/transactions/TRANSACTION_ID
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "amount": 30.99,
  "description": "Coffee and pastry at Starbucks",
  "category": "food"
}
```

### 4. Delete Transaction
```http
DELETE http://localhost:5000/api/transactions/TRANSACTION_ID
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📊 Budget Routes

### 1. Get All Budgets
```http
GET http://localhost:5000/api/budgets
Authorization: Bearer YOUR_JWT_TOKEN
```

### 2. Create Budget
```http
POST http://localhost:5000/api/budgets
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "category": "food",
  "amount": 500,
  "period": "monthly",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

---

## 📈 Investment Routes

### 1. Get All Investments
```http
GET http://localhost:5000/api/investments
Authorization: Bearer YOUR_JWT_TOKEN
```

### 2. Create Investment
```http
POST http://localhost:5000/api/investments
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Apple Inc.",
  "symbol": "AAPL",
  "quantity": 10,
  "purchasePrice": 150.00,
  "currentPrice": 175.00,
  "type": "stock"
}
```

---

## 🤖 AI Routes

### 1. Chat with AI
```http
POST http://localhost:5000/api/ai/chat
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "message": "How can I reduce my monthly expenses?",
  "context": "user_financial_data"
}
```

### 2. Get Latest AI Insights
```http
GET http://localhost:5000/api/ai/insights/latest
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📊 Analytics Routes

### 1. Category Analytics
```http
GET http://localhost:5000/api/analytics/category
Authorization: Bearer YOUR_JWT_TOKEN

# Optional query: ?period=monthly&year=2024&month=1
```

### 2. Monthly Analytics
```http
GET http://localhost:5000/api/analytics/monthly
Authorization: Bearer YOUR_JWT_TOKEN

# Optional query: ?year=2024
```

### 3. Budget vs Actual
```http
GET http://localhost:5000/api/analytics/budget-vs-actual
Authorization: Bearer YOUR_JWT_TOKEN

# Optional query: ?period=monthly&year=2024&month=1
```

---

## 🔔 Notification Routes

### 1. Get All Notifications
```http
GET http://localhost:5000/api/notifications
Authorization: Bearer YOUR_JWT_TOKEN
```

### 2. Mark Notification as Read
```http
PUT http://localhost:5000/api/notifications/NOTIFICATION_ID/read
Authorization: Bearer YOUR_JWT_TOKEN
```

### 3. Create Notification
```http
POST http://localhost:5000/api/notifications
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Budget Alert",
  "message": "You've exceeded your food budget by 20%",
  "type": "budget_alert"
}
```

---

## 📱 FCM Routes

### 1. Save FCM Token
```http
POST http://localhost:5000/api/fcm/save
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "token": "fcm_device_token_here",
  "deviceType": "android"
}
```

### 2. Delete FCM Token
```http
POST http://localhost:5000/api/fcm/delete
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "token": "fcm_device_token_here"
}
```

---

## 💳 Stripe Routes

### 1. Create Subscription Session
```http
POST http://localhost:5000/api/stripe/create-subscription-session
Content-Type: application/json

{
  "priceId": "price_premium_monthly",
  "userId": "user_id_here"
}
```

### 2. Stripe Webhook (Internal)
```http
POST http://localhost:5000/api/stripe/webhook
Content-Type: application/json
Stripe-Signature: webhook_signature

# This is called by Stripe, not directly testable
```

---

## 📈 Financial Summary Routes

### 1. Get Financial Summary
```http
GET http://localhost:5000/api/financial-summary/summary
Authorization: Bearer YOUR_JWT_TOKEN
```

### 2. Create/Update Financial Summary
```http
POST http://localhost:5000/api/financial-summary/summary
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "totalIncome": 5000,
  "totalExpenses": 3500,
  "totalSavings": 1500,
  "period": "monthly",
  "date": "2024-01-01"
}
```

---

## 🔍 Insights Routes

### 1. Get Financial Insights
```http
GET http://localhost:5000/api/insights
Authorization: Bearer YOUR_JWT_TOKEN

# Optional query: ?period=monthly&limit=10
```

---

## 🧪 Testing Tools & Scripts

### Postman Collection
You can import these requests into Postman or create a collection with all these endpoints.

### cURL Examples
```bash
# Test avatar upload
curl -X PUT http://localhost:5000/api/users/profile/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@/path/to/image.jpg"

# Test receipt upload
curl -X POST http://localhost:5000/api/receipts/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/receipt.jpg"

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### JavaScript Test Script
```javascript
// Basic test runner for file uploads
async function testFileUploads() {
  const token = 'YOUR_JWT_TOKEN';
  
  // Test avatar upload
  const avatarFormData = new FormData();
  avatarFormData.append('avatar', avatarFile);
  
  try {
    const avatarResponse = await fetch('/api/users/profile/avatar', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: avatarFormData
    });
    console.log('Avatar upload:', avatarResponse.status);
  } catch (error) {
    console.error('Avatar upload failed:', error);
  }
  
  // Test receipt upload
  const receiptFormData = new FormData();
  receiptFormData.append('image', receiptFile);
  
  try {
    const receiptResponse = await fetch('/api/receipts/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: receiptFormData
    });
    console.log('Receipt upload:', receiptResponse.status);
  } catch (error) {
    console.error('Receipt upload failed:', error);
  }
}
```

---

## ⚠️ Important Notes

1. **Authentication Required**: Most routes require a valid JWT token in the Authorization header
2. **File Upload Limits**: Images must be under 5MB and valid image formats (JPG, PNG, etc.)
3. **Error Handling**: Always check for proper error responses (400, 401, 403, 500)
4. **Environment Variables**: Ensure all required env vars are set (OpenAI, Google Vision, Stripe, etc.)
5. **Database Connection**: MongoDB must be connected for all routes to work
6. **CORS**: Make sure CORS is properly configured for frontend testing

Start with the file upload routes first since they were recently modified with the multer middleware refactoring!
