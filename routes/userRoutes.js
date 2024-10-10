const express = require('express');
const router = express.Router();

const { authCoontrollers } = require('../controllers/authControllers');

router.post('/signup', authCoontrollers.signupWithEmail);
router.post('/login', authCoontrollers.loginWithEmail);

module.exports = router;