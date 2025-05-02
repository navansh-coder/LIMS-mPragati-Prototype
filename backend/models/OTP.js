const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  resendCount: {
    type: Number,
    default: 0
  },
  lastResendTime: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Document expires in 10 minutes
  }
});

module.exports = mongoose.model('OTP', otpSchema);