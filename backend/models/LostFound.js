const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['lost', 'found'], required: true },
  location: { type: String },
  imageUrl: { type: String },
  contactInfo: { type: String },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isResolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LostFound', lostFoundSchema);