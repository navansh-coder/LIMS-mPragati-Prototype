const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OTP = require("../models/OTP");
const sendEmail = require("../config/email");
const otpGenerator = require("otp-generator");
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
        message: "User already exists with this email",
      });
    }

    // Create new user (userType and role will be set by the pre-save hook)
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
        subject: "Email Verification",
        message,
      });

      res.status(201).json({
        success: true,
        message: `OTP sent to ${newUser.email}`,
        data: {
          email: newUser.email,
          userType: newUser.userType,
          role: newUser.role,
        },
      });
    } catch (error) {
      // If email fails, delete the user and OTP
      await User.deleteOne({ email });
      await OTP.deleteOne({ email });

      return res.status(500).json({
        success: false,
        message: "Error sending OTP. Please try again.",
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
        message: "Invalid OTP or OTP expired",
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
      message: "Email verified successfully",
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
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified",
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
    const message = `Your new OTP for email verification  of ${mpragati}is ${otp}. It will expire in 10 minutes.`;

    await sendEmail({
      email: user.email,
      subject: "Email Verification OTP",
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
        message: "Please provide email and password",
      });
    }

    // 2) Check if user exists and password is correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    // 3) Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    // 4) If everything ok, send token to client
    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
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

// Forgot password - send OTP to email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist"
      });
    }

    // Generate OTP for password reset - use the same otpGenerator you're using elsewhere
    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });
    
    // Save OTP and expiration in user document
    user.resetPasswordOTP = otp;
    user.resetPasswordExpire = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes
    await user.save();

    // Create email message - use the same format as your other emails
    const message = `Your verification code for password reset on ${mpragati} is ${otp}. It will expire in 5 minutes.`;

    // Send email with OTP - use your existing sendEmail function format
    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        message: message
      });

      res.status(200).json({
        success: true,
        message: "Password reset OTP sent to your email"
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Remove the OTP if email fails
      user.resetPasswordOTP = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      
      return res.status(500).json({
        success: false,
        message: "Error sending OTP. Please try again."
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Could not send reset email. Please try again later."
    });
  }
};

exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user with provided email
    const user = await User.findOne({ 
      email,
      resetPasswordOTP: otp,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid or has expired"
      });
    }

    // OTP is valid, but don't clear it yet (needed for the actual password reset)
    res.status(200).json({
      success: true,
      message: "OTP verification successful"
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again."
    });
  }
};

// Reset password with verified OTP
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    // Find user with provided email and valid OTP
    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid or has expired"
      });
    }

    // Set new password
    user.password = password; // Make sure your User model has pre-save hook to hash the password
    
    // Clear reset password fields
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been successfully reset"
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Could not reset password. Please try again."
    });
  }
};