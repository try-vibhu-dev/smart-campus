const Complaint = require('../models/Complaint');

// Student - Submit complaint
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const complaint = await Complaint.create({
      title,
      description,
      category,
      student: req.user.id
    });

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Student - Get my complaints
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ student: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({ complaints });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin - Get all complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('student', 'name email enrollmentNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({ complaints });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin - Update complaint status
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, assignedTo } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, assignedTo, updatedAt: Date.now() },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.status(200).json({
      message: 'Complaint updated successfully',
      complaint
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};