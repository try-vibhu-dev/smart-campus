const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Announcement = require('../models/Announcement');
const LostFound = require('../models/LostFound');
const Classroom = require('../models/Classroom');

// Student stats
exports.getStudentStats = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments({ student: req.user.id });
    const pendingComplaints = await Complaint.countDocuments({ student: req.user.id, status: 'pending' });
    const resolvedComplaints = await Complaint.countDocuments({ student: req.user.id, status: 'resolved' });
    const inProgressComplaints = await Complaint.countDocuments({ student: req.user.id, status: 'in-progress' });
    const totalAnnouncements = await Announcement.countDocuments();
    const activeLostFound = await LostFound.countDocuments({ isResolved: false });

    const recentComplaints = await Complaint.find({ student: req.user.id })
      .sort({ createdAt: -1 })
      .limit(3);

    const latestAnnouncements = await Announcement.find()
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(3);

    res.status(200).json({
      stats: {
        totalComplaints,
        pendingComplaints,
        resolvedComplaints,
        inProgressComplaints,
        totalAnnouncements,
        activeLostFound,
      },
      recentComplaints,
      latestAnnouncements
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin stats
exports.getAdminStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'in-progress' });
    const totalAnnouncements = await Announcement.countDocuments();
    const totalLostFound = await LostFound.countDocuments();
    const activeLostFound = await LostFound.countDocuments({ isResolved: false });
    const totalClassrooms = await Classroom.countDocuments();

    // Category breakdown for chart
    const wifiCount = await Complaint.countDocuments({ category: 'wifi' });
    const classroomCount = await Complaint.countDocuments({ category: 'classroom' });
    const hostelCount = await Complaint.countDocuments({ category: 'hostel' });
    const libraryCount = await Complaint.countDocuments({ category: 'library' });
    const otherCount = await Complaint.countDocuments({ category: 'other' });

    const recentComplaints = await Complaint.find()
      .populate('student', 'name enrollmentNumber')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentStudents = await User.find({ role: 'student' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email department createdAt');

    res.status(200).json({
      stats: {
        totalStudents,
        totalComplaints,
        pendingComplaints,
        resolvedComplaints,
        inProgressComplaints,
        totalAnnouncements,
        totalLostFound,
        activeLostFound,
        totalClassrooms,
        categoryBreakdown: [
          { name: 'WiFi', value: wifiCount, color: '#4A90D9' },
          { name: 'Classroom', value: classroomCount, color: '#8B5CF6' },
          { name: 'Hostel', value: hostelCount, color: '#F59E0B' },
          { name: 'Library', value: libraryCount, color: '#22C55E' },
          { name: 'Other', value: otherCount, color: '#64748B' },
        ],
        statusBreakdown: [
          { name: 'Pending', value: pendingComplaints, color: '#F59E0B' },
          { name: 'In Progress', value: inProgressComplaints, color: '#4A90D9' },
          { name: 'Resolved', value: resolvedComplaints, color: '#22C55E' },
        ],
      },
      recentComplaints,
      recentStudents
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};