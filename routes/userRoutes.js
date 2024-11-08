const express = require('express');
const router = express.Router();

const { signup, verifyOtp, resendOtp, signin } = require('../controllers/userController');

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp); 
router.post('/resend-otp', resendOtp); 
router.post('/signin', signin); 

module.exports = router;
