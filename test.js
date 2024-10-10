//test.js

const { sendEmail } = require('./mailHelpers/emailHelper');
const { createTransporter, verifyTransporter } = require('./mailHelpers/emailService');


const emailData = {
  email: 'e.godswill@sotrip.app',
  subject: 'Test Email',
  templateName: 'otpTemplate',
  variables: {
    name: 'John Doe',
    otp: '123456',
    link: 'https://google.com'
  }
};

sendEmail(emailData.email, emailData.subject, emailData.templateName, emailData.variables);