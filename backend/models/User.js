const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  orgName: {
    type: String,
    required: [true, "Please provide organization name"],
  },
  userName: {
    type: String,
    required: [true, "Please provide your name"],
  },
  orgType: {
    type: String,
    enum: ["company", "startup", "institution", "individual"],
    required: [true, "Please provide organization type"],
  },
  authSignatory: {
    type: String,
    required: [true, "Please provide authorized signatory name"],
  },
  email: {
    type: String,
    required: [true, "Please provide email"],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email",
    ],
  },
  contactNumber: {
    type: String,
    required: [true, "Please provide contact number"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  orgId: {
    type: String,
    unique: true,
    required: true,
    default: function () {
      return "ORG-" + Math.random().toString(36).substring(2, 9).toUpperCase();
    },
  },
  role: {
    type: String,
    enum: ["user", "PI", "admin"],
    default: "user",
  },
});

//encryption
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
