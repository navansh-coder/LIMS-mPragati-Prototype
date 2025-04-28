const OTP = require('../models/OTP');


exports.validateOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP or OTP expired',
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP is valid',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};