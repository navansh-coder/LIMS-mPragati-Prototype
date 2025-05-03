const SampleRequest = require('../models/SampleRequest');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');


//new sample request creation
exports.createRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { 
      sampleType, 
      sampleDescription, 
      characterizationType, 
      numberOfSamples, 
      isFunded, 
      projectNumber 
    } = req.body;

    // Handle file upload
    let sampleImagePath;
    if (req.file) {
      sampleImagePath = `/uploads/${req.file.filename}`;
    }

    const request = await SampleRequest.create({
      userId: user._id,
      orgId: user.orgId,
      sampleType,
      sampleDescription,
      characterizationType,
      sampleImage: sampleImagePath,
      numberOfSamples,
      icmrProject: {
        isFunded,
        projectNumber: isFunded ? projectNumber : 'NA'
      }
    });

    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all requests for a user
exports.getUserRequests = async (req, res) => {
  try {
    const requests = await SampleRequest.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all requests (for admin/PI)
exports.getAllRequests = async (req, res) => {
  try {
    // Check if user has permission
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin' && user.role !== 'PI') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }

    const requests = await SampleRequest.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'userName email orgName');

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update request status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.user.id);

    // Only admin/PI can update status
    if (user.role !== 'admin' && user.role !== 'PI') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to perform this action'
      });
    }

    const request = await SampleRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
//get the sample request by id
exports.getSampleRequest = async (req, res) => {
  try {
    const sampleRequest = await SampleRequest.findById(req.params.id)
      .populate('userId', 'userName email orgName orgType contactNumber');

    if (!sampleRequest) {
      return res.status(404).json({
        success: false,
        message: 'Sample request not found'
      });
    }

    // Check if the user has permission to view this request
    // If user is not admin or PI, they can only see their own requests
    if (req.user.role !== 'admin' && req.user.role !== 'PI') {
      if (sampleRequest.userId._id.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this request'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: sampleRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};