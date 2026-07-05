const express = require('express');
const router = express.Router();
const { getStudentStats, getAdminStats } = require('../controllers/statsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/student', protect, getStudentStats);
router.get('/admin', protect, adminOnly, getAdminStats);

module.exports = router;