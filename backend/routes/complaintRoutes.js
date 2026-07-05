const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus
} = require('../controllers/complaintController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Student routes
router.post('/', protect, createComplaint);
router.get('/my', protect, getMyComplaints);

// Admin routes
router.get('/all', protect, adminOnly, getAllComplaints);
router.put('/:id', protect, adminOnly, updateComplaintStatus);

module.exports = router;