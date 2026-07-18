const express = require('express');
const router = express.Router();
const {
  createComplaint, getMyComplaints,
  getAllComplaints, updateComplaintStatus, deleteComplaint
} = require('../controllers/complaintController');
const { protect, staffOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createComplaint);
router.get('/my', protect, getMyComplaints);
router.get('/all', protect, staffOnly, getAllComplaints);
router.put('/:id', protect, staffOnly, updateComplaintStatus);
router.delete('/:id', protect, deleteComplaint);

module.exports = router;