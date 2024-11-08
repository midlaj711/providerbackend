const express = require('express');
const router = express.Router();

// Import the controllers
const { signup, verifyOtp, resendOtp, signin } = require('../controllers/userController');

// Define routes
router.post('/signup', signup); // Route for signup
router.post('/verify-otp', verifyOtp); // Route for OTP verification
router.post('/resend-otp', resendOtp); // Route for resending OTP
router.post('/signin', signin); // Route for signing in

module.exports = router;
