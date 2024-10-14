const User = require('../models/User');
const OtpCode = require('../models/OtpCode');
const generateCode = require('../utilities/autoGenCode');
const { sendEmail } = require('../mailHelpers/emailHelper');
const DescriptionService = require('./description.service.js');
const descriptionService = new DescriptionService();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utilities/appError');

const saltRounds = 10;

const authService = {
  // Create User with OTP for verification
async createUser(name, email, gender, password) {
    try {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const appId = generateCode.generateDigits(10);
      const otpCode = generateCode.generateDigits(6);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
      const description = descriptionService.generateDescription(gender);
      const avatar = descriptionService.generateAvatar(gender);
  
      const user = await User.create({ 
        name, 
        email, 
        gender, 
        password: hashedPassword, 
        appId, 
        description, 
        avatar 
      });
      await OtpCode.create({ 
        userId: user._id, 
        code: otpCode, 
        type: 'email-verification', 
        expiresAt 
      });
  
      // Send OTP via email
      await sendEmail(email, 'Verify Your Email', 'otpTemplate', {
        name,
        otp: otpCode,
        link: `${process.env.CLIENT_URL}/verify-email/${otpCode}`,
      });
  
      return { ...user.toJSON(), password: undefined }; // Omit password from return
    } catch (error) {
      throw new AppError(error.message, 500, 'CREATE_USER_ERROR', error);
    }
  },

  // Login User
  async loginUser(email, password) {
    const user = await User.findOne({ email });
    if (!user) throw new AppError('Invalid email or password', 401);

    if (!user.isVerifiedEmail) throw new AppError('Email not verified. Please verify your email first.', 403);

    const isValid = await user.isValidPassword(password);
    if (!isValid) throw new AppError('Invalid email or password', 401);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return { ...user.toJSON(), password: undefined, token }; // Omit password in response
  },

  // Verify Email via OTP
  async verifyEmailOtp(userId, otpCode) {
    const otp = await OtpCode.findOne({ userId, code: otpCode, type: 'email-verification' });
    if (!otp || otp.expiresAt < Date.now()) throw new AppError('Invalid or expired OTP.', 400);

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    user.isVerifiedEmail = true;
    await user.save();

    //send welcome Email
   
     await sendEmail(user.email, 'Welcome Onboard: Uyo Creators Club', 'welcome_Email', {
        name: user.name
      });


    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    return { ...user.toJSON(), password: undefined, token }; // Return user info and token
  },

  // Request new OTP for email verification
  async requestEmailOtp(userId, email) {
    const otpCode = generateCode.generateDigits(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    await OtpCode.create({ userId, code: otpCode, type: 'email-verification', expiresAt });

    // Resend OTP via email
    await sendEmail(email, 'Resend OTP', 'resent_otp', {
      name: user.name,
      otp: otpCode,
      link: `${process.env.CLIENT_URL}/verify-email/${otpCode}`,
    });

    return { message: 'OTP sent successfully.' };
  },

  // Forgot Password: Sends OTP for password reset
  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) throw new AppError('Email not found', 404);

    const otpCode = generateCode.generateDigits(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    await OtpCode.create({ userId: user._id, code: otpCode, type: 'password-reset', expiresAt });

    // Send OTP via email
    await sendEmail(email, 'Reset Your Password', 'request_password_reset', {
      name: user.name,
      otp: otpCode,
      link: `${process.env.CLIENT_URL}/reset-password/${otpCode}`,
    });

    return { message: 'Password reset OTP sent successfully.' };
  },

  // Verify OTP and reset password
  async verifyPasswordOtp(userId, otpCode, newPassword) {
    const otp = await OtpCode.findOne({ userId, code: otpCode, type: 'password-reset' });
    if (!otp || otp.expiresAt < Date.now()) throw new AppError('Invalid or expired OTP.', 400);

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    await user.save();
    await OtpCode.deleteOne({ userId, code: otpCode });

    return { message: 'Password reset successfully.' };
  },

  // Change Password
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const isValid = await user.isValidPassword(currentPassword);
    if (!isValid) throw new AppError('Current password is incorrect', 401);

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    await user.save();

    return { message: 'Password changed successfully.' };
  },

  // Get all users
  async getAllUsers() {
    try {
      const users = await User.find().select('-password -__v');
      return users;
    } catch (error) {
      throw new AppError(error.message, 500, 'GET_ALL_USERS_ERROR', error);
    }
  },

  // Get single user by ID
  async getUserById(userId) {
    try {
      const user = await User.findById(userId).select('-password -__v');
      if (!user) throw new AppError('User not found', 404);
      return user;
    } catch (error) {
      throw new AppError(error.message, 500, 'GET_USER_BY_ID_ERROR', error);
    }
  },

  // Logout (Token handling can be implemented in the frontend)
  async logout() {
    return { message: 'User logged out successfully.' };
  },
};

module.exports = authService;
