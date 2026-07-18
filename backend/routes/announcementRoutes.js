const express = require('express');
const router = express.Router();
const { createAnnouncement, getAllAnnouncements, deleteAnnouncement } = require('../controllers/announcementController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', getAllAnnouncements);
router.post('/', protect, adminOnly, upload.single('image'), createAnnouncement);
router.delete('/:id', protect, adminOnly, deleteAnnouncement);

module.exports = router;