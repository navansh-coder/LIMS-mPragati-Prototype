const User = require('../models/User');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');
const sendEmail = require('../config/email');

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified'
      });
    }

    // Check rate limiting
    const existingOTP = await OTP.findOne({ email });
    if (existingOTP) {
      // Maximum 3 resend attempts
      if (existingOTP.resendCount >= 3) {
        return res.status(429).json({
          success: false,
          message: 'Maximum resend attempts reached. Please try again after 10 minutes.'
        });
      }

      // Minimum 1 minute wait between resends
      const timeSinceLastResend = Date.now() - existingOTP.lastResendTime;
      if (timeSinceLastResend < 60000) { // 60000ms = 1 minute
        return res.status(429).json({
          success: false,
          message: `Please wait ${Math.ceil((60000 - timeSinceLastResend) / 1000)} seconds before requesting another OTP.`
        });
      }

      // Update resend count and timestamp
      existingOTP.resendCount += 1;
      existingOTP.lastResendTime = Date.now();
      await existingOTP.save();
    }

    // Generate new OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false
    });

    // Save or update OTP
    await OTP.findOneAndUpdate(
      { email },
      {
        otp,
        $setOnInsert: { resendCount: 0, lastResendTime: Date.now() }
      },
      { upsert: true, new: true }
    );

    // Send OTP email
    const message = `Your new OTP for email verification is ${otp}. It will expire in 10 minutes.`;
    await sendEmail({
      email: user.email,
      subject: 'Email Verification OTP',
      message
    });

    res.status(200).json({
      success: true,
      message: `New OTP sent to ${user.email}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.validateOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Check if required fields are provided
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }
    
    // Find the OTP record
    const otpRecord = await OTP.findOne({ email });
    
    // Check if OTP exists
    if (!otpRecord) {
      return res.status(404).json({
        success: false,
        message: 'OTP not found or expired'
      });
    }
    
    // Validate the OTP
    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'OTP validated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};