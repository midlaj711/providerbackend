const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to generate OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Signup function
exports.signup = async (req, res) => {
    const { email, mobileNumber, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { mobileNumber }] });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Hash the password and generate OTP
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOtp();
        const otpExpiration = new Date(Date.now() + 10 * 60000); // OTP expires in 10 minutes

        // Create new user
        const user = new User({
            email,
            mobileNumber,
            password: hashedPassword,
            otp,
            otpExpiration,
            role: 'user' // Default role is 'user'
        });

        await user.save();
        console.log(`OTP for ${email || mobileNumber}: ${otp}`); // OTP displayed in console
        res.status(201).json({ message: 'User created, check console for OTP' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};

// OTP verification function
exports.verifyOtp = async (req, res) => {
    const { email, mobileNumber, otp } = req.body;

    try {
        // Find user by email or mobile number
        const user = await User.findOne({ $or: [{ email }, { mobileNumber }] });
        if (!user) return res.status(400).json({ message: 'User not found' });

        // Check OTP and expiration time
        if (user.otp !== otp || user.otpExpiration < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Reset OTP after verification
        user.otp = null;
        user.otpExpiration = null;
        await user.save();

        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying OTP', error });
    }
};

// Resend OTP function
exports.resendOtp = async (req, res) => {
    const { email, mobileNumber } = req.body;

    try {
        // Find user by email or mobile number
        const user = await User.findOne({ $or: [{ email }, { mobileNumber }] });
        if (!user) return res.status(400).json({ message: 'User not found' });

        // Check if existing OTP is still valid
        if (user.otp && user.otpExpiration > new Date()) {
            console.log(`Existing OTP for ${email || mobileNumber}: ${user.otp}`);
            return res.status(200).json({ message: 'OTP sent again, check console for OTP' });
        }

        // Generate new OTP if expired
        const newOtp = generateOtp();
        user.otp = newOtp;
        user.otpExpiration = new Date(Date.now() + 10 * 60000); // Set new expiration time (10 minutes)
        await user.save();
        
        console.log(`New OTP for ${email || mobileNumber}: ${newOtp}`);
        res.status(200).json({ message: 'New OTP sent, check console for OTP' });
    } catch (error) {
        res.status(500).json({ message: 'Error resending OTP', error });
    }
};

// Signin function
exports.signin = async (req, res) => {
    const { email, mobileNumber, password } = req.body;

    try {
        // Find user by email or mobile number
        const user = await User.findOne({ $or: [{ email }, { mobileNumber }] });
        if (!user) return res.status(400).json({ message: 'User not found' });

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ message: 'Invalid password' });

        // Generate JWT tokens
        const accessToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' } // Access token expires in 15 minutes
        );
        const refreshToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' } // Refresh token expires in 7 days
        );

        // Send tokens to client
        res.status(200).json({ message: 'Signed in successfully', accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({ message: 'Error signing in', error });
    }
};
