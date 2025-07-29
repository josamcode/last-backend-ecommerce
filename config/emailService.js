// config/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Nodemailer transporter error:', error);
  } else {
    // console.log('Nodemailer transporter is ready:', success);
  }
});

module.exports = transporter;