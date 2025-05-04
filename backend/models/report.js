// Example Report model structure
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a report title']
  },
  reportData: {
    type: String,
    required: [true, 'Report content is required']
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SampleRequest'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Report must be associated with a user']
  },
  status: {
    type: String,
    enum: ['Draft', 'Verified', 'Approved', 'Published'],
    default: 'Draft'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', reportSchema);