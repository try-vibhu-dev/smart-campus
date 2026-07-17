const express = require('express');
const router = express.Router();
const {
  createComplaint, getMyComplaints,
  getAllComplaints, updateComplaintStatus, deleteComplaint
} = require('../controllers/complaintController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createComplaint);
router.get('/my', protect, getMyComplaints);
router.get('/all', protect, adminOnly, getAllComplaints);
router.put('/:id', protect, adminOnly, updateComplaintStatus);
router.delete('/:id', protect, deleteComplaint);

module.exports = router;