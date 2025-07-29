// utils/notificationEmailTemplates.js

// Template for general promotional/reminder emails
const getPromotionalEmailHTML = (username, subject, message, imageUrl = null, buttonText = null, buttonLink = null) => `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>${subject}</title>
      <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee; }
          .content { margin: 20px 0; }
          .image { text-align: center; margin: 20px 0; }
          img { max-width: 100%; height: auto; border-radius: 5px; }
          .button-container { text-align: center; margin: 30px 0; }
          .cta-button { display: inline-block; padding: 12px 25px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .cta-button:hover { background-color: #1565c0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 0.8em; color: #777; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h2>${subject}</h2>
              <p>Hi ${username},</p>
          </div>
          <div class="content">
              <p>${message.replace(/\n/g, '<br>')}</p> <!-- Convert newlines to <br> -->
              ${imageUrl ? `<div class="image"><img src="${imageUrl}" alt="Offer Image"></div>` : ''}
              ${buttonText && buttonLink ? `
              <div class="button-container">
                  <a href="${buttonLink}" class="cta-button">${buttonText}</a>
              </div>
              ` : ''}
          </div>
          <div class="footer">
              <p>You received this email because you subscribed to JOSAM notifications.</p>
              <p>&copy; ${new Date().getFullYear()} JOSAM. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;

module.exports = {
  getPromotionalEmailHTML
};