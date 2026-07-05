const Announcement = require('../models/Announcement');
const { sendNotificationToAll } = require('./notificationController');

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const announcement = await Announcement.create({
      title, content, category, postedBy: req.user.id
    });

    // Send notification to all students
    await sendNotificationToAll(
      `📢 New Announcement: ${title}`,
      content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      'announcement'
    );

    res.status(201).json({ message: 'Announcement created', announcement });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllAnnouncements = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const announcements = await Announcement.find(query)
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ announcements });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};