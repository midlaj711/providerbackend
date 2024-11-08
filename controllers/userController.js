const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.signup = async (req, res) => {
    const { email, mobileNumber, password } = req.body;

    try {
        
        const existingUser = await User.findOne({ $or: [{ email }, { mobileNumber }] });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOtp();
        const otpExpiration = new Date(Date.now() + 10 * 60000); 

        const user = new User({
            email,
            mobileNumber,
            password: hashedPassword,
            otp,
            otpExpiration,
            role: 'user' 
        });

        await user.save();
        console.log(`OTP for ${email || mobileNumber}: ${otp}`); 
        res.status(201).json({ message: 'User created, check console for OTP' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, mobileNumber, otp } = req.body;

    try {
        
        const user = await User.findOne({ $or: [{ email }, { mobileNumber }] });
        if (!user) return res.status(400).json({ message: 'User not found' });

        if (user.otp !== otp || user.otpExpiration < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
 
        user.otp = null;
        user.otpExpiration = null;
        await user.save();

        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying OTP', error });
    }
};


exports.resendOtp = async (req, res) => {
    const { email, mobileNumber } = req.body;

    try {
        
        const user = await User.findOne({ $or: [{ email }, { mobileNumber }] });
        if (!user) return res.status(400).json({ message: 'User not found' });

        if (user.otp && user.otpExpiration > new Date()) {
            console.log(`Existing OTP for ${email || mobileNumber}: ${user.otp}`);
            return res.status(200).json({ message: 'OTP sent again, check console for OTP' });
        }

      
        const newOtp = generateOtp();
        user.otp = newOtp;
        user.otpExpiration = new Date(Date.now() + 10 * 60000); 
        await user.save();
        
        console.log(`New OTP for ${email || mobileNumber}: ${newOtp}`);
        res.status(200).json({ message: 'New OTP sent, check console for OTP' });
    } catch (error) {
        res.status(500).json({ message: 'Error resending OTP', error });
    }
};


exports.signin = async (req, res) => {
    const { email, mobileNumber, password } = req.body;

    try {
      
        const user = await User.findOne({ $or: [{ email }, { mobileNumber }] });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ message: 'Invalid password' });

        const accessToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' } 
        );
        const refreshToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' } 
        );

        res.status(200).json({ message: 'Signed in successfully', accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({ message: 'Error signing in', error });
    }
};
