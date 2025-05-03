const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all admin routes
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

// User management
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/role', adminController.updateUserRole);

// Sample request management
router.get('/sample-requests', adminController.getAllSampleRequests);

module.exports = router;