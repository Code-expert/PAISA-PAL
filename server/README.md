# Paisa Pal Backend API

This is the backend API for Paisa Pal, a comprehensive personal finance management application.

## Key Improvements

### 1. Enhanced Error Handling
- Implemented a robust global error handler middleware
- Added detailed logging with Winston for better monitoring
- Improved error categorization and consistent JSON response format

### 2. Authentication Refactor
- Consolidated authentication logic into a single `authController.js`
- Unified registration and login for both email/password and Google OAuth
- Removed duplicate authentication logic from `userController.js`
- Added proper input validation using `express-validator`
- Implemented secure JWT token handling

### 3. Controller Improvements
- Added comprehensive input validation to all controllers
- Enhanced security checks to ensure users can only access their own data
- Improved response consistency across all endpoints
- Added detailed logging for monitoring purposes

### 4. Budget Controller Enhancements
- Added validation for required fields (amount, category, startDate, endDate)
- Implemented date range validation
- Added numeric validation for budget amounts
- Enhanced budget tracking with actual spending data
- Added remaining amount and percentage calculations
- Improved error handling for unauthorized access

### 5. Logging and Monitoring
- Integrated Winston logger for structured logging
- Added request context to error logs (URL, method, IP)
- Configured log rotation to prevent disk space issues
- Added environment-based logging levels

### 6. Security Improvements
- Standardized input validation across all endpoints
- Enhanced authentication and authorization checks
- Improved error responses to avoid exposing sensitive information
- Secure JWT token implementation with proper expiration

## Environment Variables

The application requires the following environment variables to be set in a `.env` file:

### Core Configuration
- `PORT`: Server port (default: 5000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token signing (use a strong secret)
- `NODE_ENV`: Environment (development/production)

### Email Services
- `EMAIL_USER`: Email service username
- `EMAIL_PASS`: Email service password
- `EMAIL_NOTIF`: Enable email notifications (true/false)

### AI & ML Services
- `OPENAI_API_KEY`: OpenAI API key for AI chat features
- `GOOGLE_CLOUD_VISION_KEY`: Google Cloud Vision API key for receipt OCR

### Payment Processing
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret

### Push Notifications
- `FIREBASE_SERVER_KEY`: Firebase service account key (JSON format)

## Postman Collection

The `Paisa-Pal-Postman-Collection.json` file contains a comprehensive set of API tests for all endpoints:

1. Authentication (Register, Login, Logout)
2. User Profile (Get, Update)
3. Transactions (CRUD operations with filtering)
4. Budgets (CRUD operations with enhanced validation)
5. Investments (CRUD operations)
6. Analytics (Category, Monthly, Budget vs Actual)
7. AI Features (Chat, Receipt OCR)
8. Notifications (Get, Mark as read)
9. Payments (Create checkout session)
10. Financial Summary (Get summary)

### Using the Collection

1. Import the JSON file into Postman
2. Update the `baseUrl` variable to match your server URL
3. Run the "Register User" request first to create an account
4. The authentication token will be automatically saved as a collection variable
5. Run subsequent requests in order

## Installation

1. Clone the repository
2. Navigate to the server directory: `cd server`
3. Install dependencies: `npm install`
4. Create a `.env` file with the required environment variables
5. Start the server: `npm run dev`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/google` - Google OAuth login

### User Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/avatar` - Upload user avatar

### Transactions
- `GET /api/transactions` - Get all transactions (with filtering)
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions/:id` - Get a specific transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction

### Budgets
- `GET /api/budgets` - Get all budgets with spending data
- `POST /api/budgets` - Create a new budget
- `PUT /api/budgets/:id` - Update a budget
- `DELETE /api/budgets/:id` - Delete a budget

### Investments
- `GET /api/investments` - Get all investments
- `POST /api/investments` - Create a new investment
- `GET /api/investments/:id` - Get a specific investment
- `PUT /api/investments/:id` - Update an investment
- `DELETE /api/investments/:id` - Delete an investment

### Analytics
- `GET /api/analytics/category` - Get category analytics
- `GET /api/analytics/monthly` - Get monthly analytics
- `GET /api/analytics/budget` - Get budget vs actual analytics

### AI Features
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/ocr` - Process receipt with OCR

### Notifications
- `GET /api/notifications` - Get all notifications
- `PUT /api/notifications/:id` - Mark notification as read

### Payments
- `POST /api/payments/create-checkout-session` - Create Stripe checkout session

### Financial Summary
- `GET /api/summary` - Get financial summary

## Logging

The application uses Winston for logging with the following configuration:

- Error logs are written to `logs/error.log`
- All logs are written to `logs/combined.log`
- Log files are rotated when they reach 5MB
- Maximum of 5 log files are kept for each log type
- Console logging is enabled in development mode

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens are signed with a strong secret
- Input validation is enforced on all endpoints
- Sensitive information is excluded from API responses
- Error responses provide minimal information in production
- Authentication tokens are properly invalidated on logout

For any issues or questions, please refer to the main project documentation or contact the development team.
