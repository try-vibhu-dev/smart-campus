const express = require('express');
const router = express.Router();
const { createPost, getAllPosts, markResolved } = require('../controllers/lostFoundController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', protect, getAllPosts);
router.post('/', protect, upload.single('image'), createPost);
router.put('/:id', protect, markResolved);

module.exports = router;