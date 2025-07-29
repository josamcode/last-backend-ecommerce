// utils/emailTemplates.js

const getVerificationEmailHTML = (username, verificationUrl) => `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Verify Your Email Address</title>
    <style>
      body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5; }
      .container { background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: inline-block; }
      a { color: #1976d2; text-decoration: none; font-weight: bold; padding: 10px 20px; background-color: #e3f2fd; border-radius: 4px; display: inline-block; margin: 20px 0; }
      a:hover { background-color: #bbdefb; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Email Verification</h1>
      <p>Hi ${username},</p>
      <p>Please click the button below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    </div>
  </body>
  </html>
`;

const getEmailVerificationSuccessHTML = (username) => `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Email Verified</title>
    <style>
      body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5; }
      .container { background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: inline-block; }
      .success { color: #388e3c; }
      a { color: #1976d2; text-decoration: none; font-weight: bold; }
      a:hover { text-decoration: underline; }
      .redirect { margin-top: 20px; font-size: 0.9em; color: #666; }
    </style>
    <script>
      setTimeout(function() {
        window.location.href = 'http://localhost:3000/login';
      }, 5000);
    </script>
  </head>
  <body>
    <div class="container">
      <h1>Email Verified Successfully!</h1>
      <p class="success">Thank you, ${username}. Your email address has been confirmed.</p>
      <p>You can now log in using your email or phone number.</p>
      <p><a href="http://localhost:3000/login">Click here to Login</a></p>
      <p class="redirect">Redirecting to login page in 5 seconds...</p>
    </div>
  </body>
  </html>
`;

const getInvalidTokenHTML = () => `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Email Verification</title>
    <style>
      body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5; }
      .container { background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: inline-block; }
      .error { color: #d32f2f; }
      a { color: #1976d2; text-decoration: none; font-weight: bold; }
      a:hover { text-decoration: underline; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Email Verification</h1>
      <p class="error">Invalid or expired verification token.</p>
      <p>Please check the link in your email or <a href="http://localhost:3000/register">register again</a>.</p>
      <p><a href="http://localhost:3000/login">Go to Login</a></p>
    </div>
  </body>
  </html>
`;

const getMissingTokenHTML = () => `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Email Verification</title>
    <style>
      body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5; }
      .container { background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: inline-block; }
      .error { color: #d32f2f; }
      a { color: #1976d2; text-decoration: none; font-weight: bold; }
      a:hover { text-decoration: underline; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Email Verification</h1>
      <p class="error">Verification token is required.</p>
      <p><a href="http://localhost:3000/login">Go to Login</a></p>
    </div>
  </body>
  </html>
`;

const getGenericVerificationErrorHTML = () => `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Email Verification</title>
    <style>
      body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5; }
      .container { background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: inline-block; }
      .error { color: #d32f2f; }
      a { color: #1976d2; text-decoration: none; font-weight: bold; }
      a:hover { text-decoration: underline; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Email Verification</h1>
      <p class="error">An error occurred during email verification. Please try again later or contact support.</p>
      <p><a href="http://localhost:3000/login">Go to Login</a></p>
    </div>
  </body>
  </html>
`;

module.exports = {
  getVerificationEmailHTML,
  getEmailVerificationSuccessHTML,
  getInvalidTokenHTML,
  getMissingTokenHTML,
  getGenericVerificationErrorHTML
};