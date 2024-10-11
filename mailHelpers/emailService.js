const nodemailer = require('nodemailer');
require('dotenv').config();

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    port: 465,
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASS
    }
  });
};

const verifyTransporter = (transporter) => {
  transporter.verify((error, success) => {
    if (error) {
      console.log('Error with transporter: ', error);
    } else {
      console.log('NODE MAILER IS ACTIVE');
    }
  });
};

module.exports = { createTransporter, verifyTransporter };
