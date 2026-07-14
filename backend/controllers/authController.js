const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, enrollmentNumber, department } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
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

// Login — direct, no OTP
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

// Verify OTP (kept for local dev)
exports.verifyOTP = async (req, res) => {
  res.status(200).json({ message: 'OTP not required in production' });
};

// Resend OTP (kept for local dev)
exports.resendOTP = async (req, res) => {
  res.status(200).json({ message: 'OTP not required in production' });
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: `"Smart Campus" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Smart Campus - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px;">
          <h2>Password Reset Request</h2>
          <p>Hi ${user.name},</p>
          <p>Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.</p>
          <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin: 20px 0;">Reset My Password</a>
          <p style="color: #94a3b8; font-size: 13px;">If you didn't request this, ignore this email.</p>
        </div>
      `
    });

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error('FORGOT PASSWORD ERROR:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset link' });
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();
    res.status(200).json({ message: 'Password reset successful! You can now login.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};