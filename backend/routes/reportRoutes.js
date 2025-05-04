const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Create a report - all authenticated users can create reports
router.post('/', protect, reportController.createReport);

// Get all reports - admin only
router.get('/', protect, restrictTo('admin', 'PI'), reportController.getAllReports);

// Get reports for logged in user
router.get('/my-reports', protect, reportController.getUserReports);

// Get eligible requests for report creation
router.get('/eligible-requests', protect, reportController.getEligibleRequests);

// Get specific report by ID
router.get('/:id', protect, reportController.getReportById);

// Submit report for verification
router.patch('/:id/submit', protect, reportController.submitForVerification);

// Verify a report (employee/PI only)
router.patch('/:id/verify', protect, restrictTo('employee', 'PI'), reportController.verifyReport);

// Review a report (admin only)
router.patch('/:id/review', protect, restrictTo('admin', 'PI'), reportController.reviewReport);

// Publish a report (admin only)
router.patch('/:id/publish', protect, restrictTo('admin'), reportController.publishReport);

module.exports = router;