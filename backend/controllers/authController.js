const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ── REGISTER ──
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, enrollmentNumber, department, secretKey } = req.body;

    if (role === 'admin' && secretKey !== process.env.ADMIN_SECRET)
      return res.status(403).json({ message: 'Invalid admin secret key' });
    if (role === 'professor' && secretKey !== process.env.PROF_SECRET)
      return res.status(403).json({ message: 'Invalid professor secret key' });

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: 'User already exists with this email' });

    if (role === 'student' && enrollmentNumber) {
      const existingEnrollment = await User.findOne({ enrollmentNumber });
      if (existingEnrollment)
        return res.status(400).json({ message: 'This enrollment number is already registered' });
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

// ── LOGIN — Step 1: verify credentials, send OTP ──
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const otp = generateOTP();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpire = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    const { error } = await resend.emails.send({
      from: 'Smart Campus <onboarding@resend.dev>',
      to: email,
      subject: 'Smart Campus - Your Login OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #2563EB;">Login Verification</h2>
          <p>Hi ${user.name},</p>
          <p>Your one-time password is:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #1E3A5F;">${otp}</span>
          </div>
          <p>This OTP expires in <strong>5 minutes</strong>.</p>
          <p style="color: #6B7280; font-size: 12px;">If you didn't try to login, ignore this email.</p>
        </div>
      `
    });

    if (error) {
      console.error('OTP EMAIL ERROR:', error);
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.status(200).json({ message: 'OTP sent to your email', email: user.email });
  } catch (error) {
    console.error('LOGIN ERROR:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── LOGIN — Step 2: verify OTP, issue token ──
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (!user.otp || !user.otpExpire)
      return res.status(400).json({ message: 'No OTP requested. Please login again.' });

    if (new Date() > user.otpExpire) {
      user.otp = null;
      user.otpExpire = null;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please login again.' });
    }

    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) return res.status(400).json({ message: 'Invalid OTP. Please try again.' });

    user.otp = null;
    user.otpExpire = null;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('VERIFY OTP ERROR:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── RESEND OTP ──
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const otp = generateOTP();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpire = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    const { error } = await resend.emails.send({
      from: 'Smart Campus <onboarding@resend.dev>',
      to: email,
      subject: 'Smart Campus - New OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #2563EB;">New OTP Requested</h2>
          <p>Hi ${user.name}, your new OTP is:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #1E3A5F;">${otp}</span>
          </div>
          <p>This OTP expires in <strong>5 minutes</strong>.</p>
        </div>
      `
    });

    if (error) {
      console.error('RESEND OTP EMAIL ERROR:', error);
      return res.status(500).json({ message: 'Failed to resend OTP' });
    }

    res.status(200).json({ message: 'New OTP sent to your email' });
  } catch (error) {
    console.error('RESEND OTP ERROR:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── FORGOT PASSWORD ──
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const { error } = await resend.emails.send({
      from: 'Smart Campus <onboarding@resend.dev>',
      to: email,
      subject: 'Smart Campus - Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #2563EB;">Password Reset Request</h2>
          <p>Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #2563EB; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">Reset Password</a>
          <p style="color: #6B7280; font-size: 12px;">If you didn't request this, ignore this email.</p>
        </div>
      `
    });

    if (error) {
      console.error('FORGOT PASSWORD EMAIL ERROR:', error);
      return res.status(500).json({ message: 'Failed to send reset email' });
    }

    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('FORGOT PASSWORD ERROR:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── RESET PASSWORD ──
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset link' });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};