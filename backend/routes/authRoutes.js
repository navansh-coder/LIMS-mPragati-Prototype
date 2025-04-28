const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const otpController = require('../controllers/otpController');
const authMiddleware = require('../middlewares/authMiddleware');

// Authentication routes
router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/login', authController.login);

// OTP routes
router.post('/validate-otp', otpController.validateOTP);

// Protected routes
router.use(authMiddleware.protect);
router.get('/me', authController.getMe);

module.exports = router;