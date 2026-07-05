const Classroom = require('../models/Classroom');

// Add classroom
exports.addClassroom = async (req, res) => {
  try {
    const { name, building, capacity, type } = req.body;
    const classroom = await Classroom.create({ name, building, capacity, type, schedule: [] });
    res.status(201).json({ message: 'Classroom added', classroom });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all classrooms
exports.getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find();
    res.status(200).json({ classrooms });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check availability
exports.checkAvailability = async (req, res) => {
  try {
    const { day, time } = req.query;
    const classrooms = await Classroom.find();
    const available = classrooms.filter(room => {
      const busy = room.schedule.some(s =>
        s.day === day && s.startTime <= time && s.endTime >= time
      );
      return !busy;
    });
    res.status(200).json({ available });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete classroom
exports.deleteClassroom = async (req, res) => {
  try {
    await Classroom.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Classroom deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update classroom details
exports.updateClassroom = async (req, res) => {
  try {
    const { name, building, capacity, type } = req.body;
    const classroom = await Classroom.findByIdAndUpdate(
      req.params.id,
      { name, building, capacity, type },
      { new: true }
    );
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });
    res.status(200).json({ message: 'Classroom updated', classroom });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add schedule slot
exports.addScheduleSlot = async (req, res) => {
  try {
    const { day, startTime, endTime, subject, teacher } = req.body;
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

    classroom.schedule.push({ day, startTime, endTime, subject, teacher });
    await classroom.save();

    res.status(201).json({ message: 'Schedule slot added', classroom });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete schedule slot
exports.deleteScheduleSlot = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

    classroom.schedule = classroom.schedule.filter(
      s => s._id.toString() !== req.params.slotId
    );
    await classroom.save();

    res.status(200).json({ message: 'Schedule slot deleted', classroom });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update schedule slot
exports.updateScheduleSlot = async (req, res) => {
  try {
    const { day, startTime, endTime, subject, teacher } = req.body;
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

    const slot = classroom.schedule.id(req.params.slotId);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    slot.day = day;
    slot.startTime = startTime;
    slot.endTime = endTime;
    slot.subject = subject;
    slot.teacher = teacher;
    await classroom.save();

    res.status(200).json({ message: 'Schedule slot updated', classroom });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};