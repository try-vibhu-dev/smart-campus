const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ── REGISTER ──
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, enrollmentNumber, department, secretKey } = req.body;

    if (role === 'admin' && secretKey !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: 'Invalid admin secret key' });
    }
    if (role === 'professor' && secretKey !== process.env.PROF_SECRET) {
      return res.status(403).json({ message: 'Invalid professor secret key' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: 'User already exists with this email' });

    if (role === 'student' && enrollmentNumber) {
      const existingEnrollment = await User.findOne({ enrollmentNumber });
      if (existingEnrollment) {
        return res.status(400).json({ message: 'This enrollment number is already registered' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role, enrollmentNumber, department });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('REGISTER ERROR:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── LOGIN ──
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};