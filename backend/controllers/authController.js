const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const sendEmail = require('../config/email');
const otpGenerator = require('otp-generator');
const mpragati = "https://mpragati.in";

// Utility func to generate token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Register func
exports.register = async (req, res) => {
  try {
    const {
      orgName,
      userName,
      orgType,
      authSignatory,
      email,
      contactNumber,
      password,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create new user (not verified yet)
    const newUser = await User.create({
      orgName,
      userName,
      orgType,
      authSignatory,
      email,
      contactNumber,
      password,
    });

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    // Save OTP to database
    await OTP.create({
      email,
      otp,
    });

    // Send OTP to user's email
    const message = `Your OTP for email verification on ${mpragati} is ${otp}. It will expire in 5 minutes.`;

    try {
      await sendEmail({
        email: newUser.email,
        subject: 'Email Verification',
        message,
      });

      res.status(201).json({
        success: true,
        message: `OTP sent to ${newUser.email}`,
        data: {
          email: newUser.email,
        },
      });
    } catch (error) {
      // If email fails, delete the user and OTP
      await User.deleteOne({ email });
      await OTP.deleteOne({ email });

      return res.status(500).json({
        success: false,
        message: 'Error sending OTP. Please try again.',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify OTP and activate user
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find the most recent OTP for the user
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP or OTP expired',
      });
    }

    // OTP is valid, verify the user
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    // Delete the OTP record
    await OTP.deleteMany({ email });

    // Create token
    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified',
      });
    }

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email });

    // Generate new OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    // Save OTP to database
    await OTP.create({
      email,
      otp,
    });

    // Send OTP to user's email
    const message = `Your new OTP for email verification is ${otp}. It will expire in 10 minutes.`;

    await sendEmail({
      email: user.email,
      subject: 'Email Verification OTP',
      message,
    });

    res.status(200).json({
      success: true,
      message: `New OTP sent to ${user.email}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // 2) Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password',
      });
    }

    // 3) Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email first',
      });
    }

    // 4) If everything ok, send token to client
    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get current logged in user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};