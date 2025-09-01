/**
 * Email verification template
 * @param {string} name - User's name
 * @param {string} verificationCode - 6-digit verification code
 * @returns {object} - Email content with text and HTML
 */
export const getVerificationEmailTemplate = (name, verificationCode) => {
  const text = `
Hi ${name},

Welcome to PaisaPal! Please verify your email address to complete your registration.

Your verification code is: ${verificationCode}

Enter this code in the app to verify your email address.

This code will expire in 15 minutes.

If you didn't create an account with PaisaPal, please ignore this email.

Best regards,
The PaisaPal Team
  `;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - PaisaPal</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to PaisaPal!</h1>
      <p>Your Personal Finance Companion</p>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>Thank you for joining PaisaPal! We're excited to help you manage your finances better.</p>
      <p>To complete your registration and start using all our features, please verify your email address by entering the code below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="background: #f0f0f0; border: 2px dashed #667eea; padding: 20px; border-radius: 10px; display: inline-block;">
          <h1 style="margin: 0; color: #667eea; font-size: 32px; letter-spacing: 5px; font-family: monospace;">${verificationCode}</h1>
        </div>
      </div>
      
      <p style="text-align: center;"><strong>Enter this code in the PaisaPal app to verify your email.</strong></p>
      
      <p><strong>This code will expire in 15 minutes.</strong></p>
      
      <p>If you didn't create an account with PaisaPal, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>The PaisaPal Team</p>
    </div>
  </div>
</body>
</html>
  `;

  return { text, html };
};

/**
 * Email verification success template
 * @param {string} name - User's name
 * @returns {object} - Email content with text and HTML
 */
export const getWelcomeEmailTemplate = (name) => {
  const text = `
Hi ${name},

Your email has been successfully verified! Welcome to PaisaPal.

You can now access all features:
- Track your transactions
- Create and manage budgets
- Get AI-powered financial insights
- Scan receipts with OCR
- Set financial goals

Start your financial journey today by logging into your account.

Best regards,
The PaisaPal Team
  `;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to PaisaPal!</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to PaisaPal!</h1>
      <p>Your email has been verified successfully</p>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>Congratulations! Your email has been successfully verified and your PaisaPal account is now active.</p>
      
      <h3>What you can do now:</h3>
      <div class="feature">
        <strong>💰 Track Transactions</strong><br>
        Monitor your income and expenses in real-time
      </div>
      <div class="feature">
        <strong>📊 Manage Budgets</strong><br>
        Create budgets and track your spending goals
      </div>
      <div class="feature">
        <strong>🤖 AI Insights</strong><br>
        Get personalized financial advice and insights
      </div>
      <div class="feature">
        <strong>📱 Receipt Scanning</strong><br>
        Scan receipts with OCR technology
      </div>
      
      <p>Start your financial journey today by logging into your account and exploring all the features PaisaPal has to offer!</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>The PaisaPal Team</p>
    </div>
  </div>
</body>
</html>
  `;

  return { text, html };
};
