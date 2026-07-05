const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  enrollmentNumber: { type: String },
  department: { type: String },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpire: { type: Date, default: null },
  otp: { type: String, default: null },
  otpExpire: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
