const express = require('express');
const router = express.Router();
const cors = require('cors');
router.use(cors());

const { signupWithEmail, loginWithEmail, logout, verifyEmail, requestEmailOtp, forgotPassword, resetPassword, changePassword, getAllUsers,  getUserById } = require('../controllers/authControllers');

router.post('/signup', signupWithEmail);
router.post('/login', loginWithEmail);
router.post('/logout', logout);

// Email Verification
router.post('/verify-email', verifyEmail);
router.post('/request-email-otp', requestEmailOtp);

// Forgot/Reset Password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Change Password
router.post('/change-password', changePassword);

// get users
router.get('/all', getAllUsers);
router.get('/single/:id', getUserById);

module.exports = router;

