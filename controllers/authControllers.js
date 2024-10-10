const authService = require('../services/authService');
const AppError = require('../utilities/appError');

const authCoontrollers = {
    // Register Controller
  async signupWithEmail(req, res, next) {
    const { name, email, password } = req.body;

    try {
      const user = await authService.createUser(name, email, password);
      res.status(201).json({
        status: 'success',
        message: 'Signup successful',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // Login COntrller
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


};


// const authController = {signupController}

module.exports = {authCoontrollers};