const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    mobileNumber: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    otp: { type: String },
    otpExpiration: { type: Date },
    accessToken: { type: String },
    refreshToken: { type: String }
});

module.exports = mongoose.model('User', userSchema);
