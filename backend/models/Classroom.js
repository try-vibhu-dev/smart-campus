const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  building: { type: String },
  capacity: { type: Number },
  type: { type: String, enum: ['classroom', 'lab'], default: 'classroom' },
  schedule: [{
    day: String,
    startTime: String,
    endTime: String,
    subject: String,
    teacher: String
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Classroom', classroomSchema);