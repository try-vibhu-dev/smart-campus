const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// ── EMAIL TRANSPORTER ──
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ── REGISTER ──
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, enrollmentNumber, department, secretKey } = req.body;

    if (role === 'admin') {
      if (secretKey !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: 'Invalid admin secret key' });
      }
    }
    if (role === 'professor') {
      if (secretKey !== process.env.PROF_SECRET) {
        return res.status(403).json({ message: 'Invalid professor secret key' });
      }
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
    const user = await User.create({
      name, email, password: hashedPassword,
      role, enrollmentNumber, department
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

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

// ── LOGIN (sends OTP) ──
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();

    // Send OTP email
    try {
      await transporter.sendMail({
        from: `"Smart Campus" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Smart Campus OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
            <h2 style="color: #2563EB;">Smart Campus - OTP Verification</h2>
            <p>Your one-time password is:</p>
            <h1 style="letter-spacing: 8px; color: #1E3A5F; font-size: 36px;">${otp}</h1>
            <p>This OTP will expire in <strong>5 minutes</strong>.</p>
            <p style="color: #6B7280; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('Email error:', emailErr.message);
    }

    res.status(200).json({ message: 'OTP sent to your email', email });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── VERIFY OTP ──
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (!user.otp || !user.otpExpire) {
      return res.status(400).json({ message: 'OTP not generated. Please login again.' });
    }

    if (new Date() > user.otpExpire) {
      user.otp = null;
      user.otpExpire = null;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please login again.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // OTP valid — clear it and return token
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'OTP verified successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── RESEND OTP ──
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();

    try {
      await transporter.sendMail({
        from: `"Smart Campus" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your New Smart Campus OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
            <h2 style="color: #2563EB;">Smart Campus - New OTP</h2>
            <p>Your new one-time password is:</p>
            <h1 style="letter-spacing: 8px; color: #1E3A5F; font-size: 36px;">${otp}</h1>
            <p>This OTP will expire in <strong>5 minutes</strong>.</p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('Email error:', emailErr.message);
    }

    res.status(200).json({ message: 'New OTP sent to your email' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── FORGOT PASSWORD ──
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await transporter.sendMail({
        from: `"Smart Campus" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Smart Campus - Password Reset',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
            <h2 style="color: #2563EB;">Password Reset Request</h2>
            <p>You requested to reset your password. Click the button below:</p>
            <a href="${resetUrl}" style="
              display: inline-block;
              background: #2563EB;
              color: white;
              padding: 12px 24px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: bold;
              margin: 16px 0;
            ">Reset Password</a>
            <p>This link expires in <strong>15 minutes</strong>.</p>
            <p style="color: #6B7280; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('Email error:', emailErr.message);
    }

    res.status(200).json({ message: 'Password reset link sent to your email' });

  } catch (error) {
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

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully. You can now login.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};