const express = require('express');
const router = express.Router();
const { createPost, getAllPosts, markResolved, deletePost } = require('../controllers/lostFoundController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', protect, getAllPosts);
router.post('/', protect, upload.single('image'), createPost);
router.put('/:id', protect, markResolved);
router.delete('/:id', protect, deletePost);

module.exports = router;