const Complaint = require('../models/Complaint');
const { sendNotificationToUser } = require('./notificationController');

exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const complaint = await Complaint.create({
      title, description, category, student: req.user.id
    });
    res.status(201).json({ message: 'Complaint submitted successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Student - Get my complaints (with filters)
exports.getMyComplaints = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    const query = { student: req.user.id };

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.status(200).json({ complaints });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin - Get all complaints (with filters)
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const complaints = await Complaint.find(query)
      .populate('student', 'name email enrollmentNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({ complaints });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, assignedTo, updatedAt: Date.now() },
      { new: true }
    );

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // Notify student about status update
    await sendNotificationToUser(
      complaint.student,
      `🔧 Complaint Update: ${complaint.title}`,
      `Your complaint status has been updated to "${status}"`,
      'complaint'
    );

    res.status(200).json({ message: 'Complaint updated successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};