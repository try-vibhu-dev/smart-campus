const Notification = require('../models/Notification');
const PushSubscription = require('../models/PushSubscription');
const webpush = require('web-push');
const User = require('../models/User');

webpush.setVapidDetails(
  'mailto:' + process.env.EMAIL_USER,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Save browser push subscription
exports.saveSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;
    const existing = await PushSubscription.findOne({ user: req.user.id });
    if (existing) {
      existing.subscription = subscription;
      await existing.save();
    } else {
      await PushSubscription.create({ user: req.user.id, subscription });
    }
    res.status(200).json({ message: 'Subscription saved' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all notifications for logged in user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark all as read
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
    res.status(200).json({ message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark single as read
exports.markRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper - send notification to a user (used internally)
exports.sendNotificationToUser = async (userId, title, message, type) => {
  try {
    // Save in-app notification
    await Notification.create({ recipient: userId, title, message, type });

    // Send browser push notification
    const pushSub = await PushSubscription.findOne({ user: userId });
    if (pushSub) {
      await webpush.sendNotification(
        pushSub.subscription,
        JSON.stringify({ title, message })
      ).catch(err => console.log('Push error:', err.message));
    }
  } catch (error) {
    console.log('Notification error:', error.message);
  }
};

// Helper - send notification to ALL students (used internally)
exports.sendNotificationToAll = async (title, message, type) => {
  try {
    const students = await User.find({ role: 'student' });
    for (const student of students) {
      await Notification.create({ recipient: student._id, title, message, type });
    }

    // Send browser push to all subscribed students
    const pushSubs = await PushSubscription.find();
    const payload = JSON.stringify({ title, message });
    for (const sub of pushSubs) {
      await webpush.sendNotification(sub.subscription, payload)
        .catch(err => console.log('Push error:', err.message));
    }
  } catch (error) {
    console.log('Notification broadcast error:', error.message);
  }
};