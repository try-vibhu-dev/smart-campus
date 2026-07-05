// server satrt comannd --> node server.js

const express = require('express');   
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/lostfound', require('./routes/lostFoundRoutes'));
app.use('/api/classrooms', require('./routes/classroomRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/uploads', express.static('uploads'));
app.use('/api/profile', require('./routes/profileRoutes'));

// Test route
app.get('/', (req, res) => {
  res.send('Smart Campus API is running!');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected!');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err);
  });