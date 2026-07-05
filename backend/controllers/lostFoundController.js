const LostFound = require('../models/LostFound');
const { sendNotificationToAll } = require('./notificationController');

exports.createPost = async (req, res) => {
  try {
    const { title, description, type, location, contactInfo } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const post = await LostFound.create({
      title, description, type, location, imageUrl, contactInfo, postedBy: req.user.id
    });

    // Notify all students
    await sendNotificationToAll(
      `${type === 'lost' ? '🔍 Lost Item' : '✅ Found Item'}: ${title}`,
      description.substring(0, 100) + (description.length > 100 ? '...' : ''),
      'lostfound'
    );

    res.status(201).json({ message: 'Post created', post });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const { type, resolved, search } = req.query;
    const query = {};

    if (type) query.type = type;
    if (resolved !== undefined) query.isResolved = resolved === 'true';
    if (search) query.title = { $regex: search, $options: 'i' };

    const posts = await LostFound.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.markResolved = async (req, res) => {
  try {
    const post = await LostFound.findByIdAndUpdate(
      req.params.id, { isResolved: true }, { new: true }
    );
    res.status(200).json({ message: 'Marked as resolved', post });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};