const authService = require('../services/authService');
const AppError = require('../utilities/appError');

const authControllers = {
  // Register Controller
  async signupWithEmail(req, res, next) {
    const { name, email, gender, password } = req.body;

    try {
      const user = await authService.createUser(name, email, gender, password);
      res.status(201).json({
        status: 'success',
        message: 'Signup successful, please verify your email',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // Login Controller
  async loginWithEmail(req, res, next) {
    const { email, password } = req.body;

    try {
      const user = await authService.loginUser(email, password);
      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // Verify Email Controller
  async verifyEmail(req, res, next) {
    const { userId, otpCode } = req.body;

    try {
      const user = await authService.verifyEmailOtp(userId, otpCode);
      res.status(200).json({
        status: 'success',
        message: 'Email verified successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // Request OTP for Signup
  async requestEmailOtp(req, res, next) {
    const { userId, email } = req.body;

    try {
      const response = await authService.requestEmailOtp(userId, email);
      res.status(200).json({
        status: 'success',
        message: response.message,
      });
    } catch (error) {
      next(error);
    }
  },

  // Forgot Password Controller
  async forgotPassword(req, res, next) {
    const { email } = req.body;

    try {
      const response = await authService.forgotPassword(email);
      res.status(200).json({
        status: 'success',
        message: response.message,
      });
    } catch (error) {
      next(error);
    }
  },

  // Verify OTP and Reset Password
  async resetPassword(req, res, next) {
    const { userId, otpCode, newPassword } = req.body;

    try {
      const response = await authService.verifyPasswordOtp(userId, otpCode, newPassword);
      res.status(200).json({
        status: 'success',
        message: response.message,
      });
    } catch (error) {
      next(error);
    }
  },

  // Change Password Controller
  async changePassword(req, res, next) {
    const { userId, currentPassword, newPassword } = req.body;

    try {
      const response = await authService.changePassword(userId, currentPassword, newPassword);
      res.status(200).json({
        status: 'success',
        message: response.message,
      });
    } catch (error) {
      next(error);
    }
  },

  // Logout Controller
  async logout(req, res, next) {
    try {
      const response = await authService.logout();
      res.status(200).json({
        status: 'success',
        message: response.message,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authControllers;
