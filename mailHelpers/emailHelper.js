const fs = require('fs');
const path = require('path');
const { createTransporter, verifyTransporter } = require('./emailService');

const loadTemplate = (templateName, variables = {}) => {
  const templatePath = path.join(__dirname, '..', 'mailHelpers', 'templates', `${templateName}.html`);
  let template = fs.readFileSync(templatePath, 'utf-8');

  for (let [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(regex, value);
  }

  return template;
};

const sendEmail = async (email, subject, templateName, variables) => {
  try {
    const transporter = createTransporter();
    verifyTransporter(transporter);

    const emailTemplate = loadTemplate(templateName, variables);

    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: subject,
      html: emailTemplate
    };

    await transporter.sendMail(mailOptions);
    console.log(`${subject} email sent successfully to ${email}`);
  } catch (error) {
    console.error(`Error sending ${subject} email:`, error);
  }
};

module.exports = { sendEmail };