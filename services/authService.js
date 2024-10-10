const User = require('../models/User');
const OtpCode = require('../models/OtpCode');
const generateCode = require('../utilities/autoGenCode');
const { sendEmail } = require('../mailHelpers/emailHelper');
// const { createTransporter, verifyTransporter } = require('../mailHelpers/emailService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const saltRounds = 10;

const authService = {
  async createUser(name, email, password) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const appId = generateCode.generateDigits(10);
    const otpCode = generateCode.generateDigits(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Expires in 15 minutes

    const user = await User.create({ name, email, password: hashedPassword, appId });
    await OtpCode.create({ userId: user._id, code: otpCode, type: 'email-verification', expiresAt });

    // Send OTP via email
    await sendEmail(email, 'Verify Your Email', 'otpTemplate', {
      name,
      otp: otpCode,
      link: `${process.env.CLIENT_URL}/verify-email/${otpCode}`,
    });

    return user;
  },

  // Login
  async loginUser(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isValid = await user.isValidPassword(password);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return { ...user.toJSON(), token };
  },
};

module.exports = authService;