const express = require('express');
const router = express.Router();
const {
  saveSubscription,
  getNotifications,
  markAllRead,
  markRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/subscribe', protect, saveSubscription);
router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllRead);
router.put('/read/:id', protect, markRead);

module.exports = router;