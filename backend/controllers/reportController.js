const Report = require('../models/report');
const SampleRequest = require('../models/SampleRequest');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const { generatePDF } = require('../utils/reportUtility');

// Create a draft report
exports.createReport = async (req, res) => {
  try {
    // Add the current user's ID to the request body
    req.body.userId = req.user.id;
    
    const report = await Report.create(req.body);
    
    // If report is associated with a request, update the request with the report ID
    if (req.body.requestId) {
      await SampleRequest.findByIdAndUpdate(
        req.body.requestId,
        { reportId: report._id }
      );
    }
    
    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Submit report for verification
exports.submitForVerification = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    // Only draft reports can be submitted for verification
    if (report.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Report is currently ${report.status} and cannot be submitted for verification`
      });
    }
    
    report.status = 'Pending Verification';
    await report.save();
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Verify a report (for employee/PI role)
exports.verifyReport = async (req, res) => {
  try {
    // Implementation
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: 'Verified', verifiedBy: req.user.id },
      { new: true }
    );
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Approve or reject a verified report (by admin)
exports.reviewReport = async (req, res) => {
  try {
    const { decision, approvalNotes } = req.body;
    
    if (!['Approved', 'Rejected'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be either Approved or Rejected'
      });
    }
    
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    // Only verified reports can be approved/rejected
    if (report.status !== 'Verified') {
      return res.status(400).json({
        success: false,
        message: `Report is currently ${report.status} and cannot be reviewed`
      });
    }
    
    // Update report with approval/rejection details
    report.status = decision;
    report.approvalDetails = {
      approvedBy: req.user.id,
      approvedAt: Date.now(),
      approvalNotes: approvalNotes || ''
    };
    
    // If approved, generate a PDF report
    if (decision === 'Approved') {
      // Get all the necessary data for the PDF
      const sampleRequest = await SampleRequest.findById(report.sampleRequestId);
      const user = await User.findById(report.userId);
      const verifier = await User.findById(report.verificationDetails.verifiedBy);
      const approver = await User.findById(req.user.id);
      
      // Generate PDF
      try {
        const pdfPath = await generatePDF(report, sampleRequest, user, verifier, approver);
        report.reportPdfUrl = pdfPath;
        
        // Update the sample request status to completed if not already
        await SampleRequest.findByIdAndUpdate(
          report.sampleRequestId,
          { status: 'Completed' },
          { new: true }
        );
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError);
        // Continue with approval even if PDF generation fails, but log the error
      }
    }
    
    await report.save();
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all reports (admin only)
exports.getAllReports = async (req, res) => {
  try {
    // Implementation
    const reports = await Report.find().populate('requestId userId');
    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Get reports for the current user
exports.getUserReports = async (req, res) => {
  try {
    // Implementation
    const reports = await Report.find({ userId: req.user.id }).populate('requestId');
    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Get sample requests eligible for report creation
exports.getEligibleRequests = async (req, res) => {
  try {
    // Implementation for finding requests that can have reports created
    const eligibleRequests = await SampleRequest.find({
      status: 'Completed',
      reportId: { $exists: false }
    });
    
    res.status(200).json({
      success: true,
      count: eligibleRequests.length,
      data: eligibleRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Get a specific report by ID
exports.getReportById = async (req, res) => {
  try {
    // Implementation
    const report = await Report.findById(req.params.id).populate('requestId userId');
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Publish a report (final step, usually admin only)
exports.publishReport = async (req, res) => {
  try {
    // Implementation
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: 'Published', publishedBy: req.user.id },
      { new: true }
    );
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};