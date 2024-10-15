const fs = require('fs');
const path = require('path');
const { createTransporter, verifyTransporter } = require('./emailService');

// Load the email template and replace placeholders with provided variables
const loadTemplate = (templateName, variables = {}) => {
  const templatePath = path.join(__dirname, '..', 'mailHelpers', 'templates', `${templateName}.html`);
  let template = fs.readFileSync(templatePath, 'utf-8');

  // Replace all variables in the template with actual values
  for (let [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(regex, value);
  }

  return template;
};

// Send email with sender's name from environment variables and attachment support
const sendEmail = async (email, subject, templateName, variables, attachments = []) => {
  try {
    const transporter = createTransporter();
    verifyTransporter(transporter);

    // Load the HTML email template and replace variables
    const emailTemplate = loadTemplate(templateName, variables);

    // Define mail options, including sender's name and any attachments
    const mailOptions = {
      from: `${process.env.senderName}>`,  // Sender's name from environment variables
      to: email,
      subject: subject,
      html: emailTemplate,
      attachments: attachments  // Array of attachment objects
    };

    // Send email using the transporter
    await transporter.sendMail(mailOptions);
    console.log(`${subject} email sent successfully to ${email}`);
  } catch (error) {
    console.error(`Error sending ${subject} email:`, error);
  }
};

module.exports = { sendEmail };
