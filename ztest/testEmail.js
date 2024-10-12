const { sendEmail } = require('../mailHelpers/emailHelper');

// Example email data
const emailData = {
  email: 'e.godswill@sotrip.app',
  subject: 'Test Email with Attachments',
  templateName: 'otpTemplate',
  variables: {
    name: 'John Doe',
    otp: '123456',
    link: 'https://google.com'
  }
};

// Example attachments array
const attachments = [
  {
    filename: 'ticket.html',
    path: './resources/ticket.html'  // Absolute or relative path to the file
  },
  // {
  //   filename: 'image.jpg',
  //   path: './path/to/image.jpg'
  // }
];

// Sending email with attachments
sendEmail(emailData.email, emailData.subject, emailData.templateName, emailData.variables, attachments);
