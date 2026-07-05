const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP email
const sendOTPEmail = async (email, name, otp) => {
  await transporter.sendMail({
    from: `"Smart Campus" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Smart Campus - Your Login OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: #2563eb; color: white; width: 60px; height: 60px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">SC</div>
          <h1 style="color: #1e293b; margin-top: 15px;">Smart Campus</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1e293b;">Login Verification</h2>
          <p style="color: #64748b;">Hi ${name},</p>
          <p style="color: #64748b;">Use the OTP below to complete your login. It expires in <strong>5 minutes</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #f1f5f9; border: 2px dashed #2563eb; border-radius: 12px; padding: 20px; display: inline-block;">
              <span style="font-size: 42px; font-weight: bold; letter-spacing: 12px; color: #2563eb;">${otp}</span>
            </div>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">If you didn't try to login, please ignore this email and your account will remain secure.</p>
        </div>
        <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">Smart Campus Assistant System</p>
      </div>
    `
  });
  const sendOTPEmail = async (email, name, otp) => {
  const info = await transporter.sendMail({
    // ... existing code stays same
  });
  console.log('Email send response:', info.response);
  console.log('Message ID:', info.messageId);
};
};

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
    console.error('LOGIN ERROR:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
}
};

// Login - Step 1 (verify credentials and send OTP)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate OTP
    const otp = generateOTP();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpire = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    // Send OTP email
    await sendOTPEmail(user.email, user.name, otp);
    console.log(`OTP sent to ${user.email}: ${otp}`);

    res.status(200).json({
      message: 'OTP sent to your email',
      email: user.email,
      requiresOTP: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login - Step 2 (verify OTP)
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (!user.otp || !user.otpExpire) {
      return res.status(400).json({ message: 'No OTP requested. Please login again.' });
    }

    if (Date.now() > user.otpExpire) {
      user.otp = null;
      user.otpExpire = null;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please login again.' });
    }

    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) return res.status(400).json({ message: 'Invalid OTP. Please try again.' });

    // Clear OTP
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const otp = generateOTP();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendOTPEmail(user.email, user.name, otp);

    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #2563eb; color: white; width: 60px; height: 60px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">SC</div>
            <h1 style="color: #1e293b; margin-top: 15px;">Smart Campus</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b;">Password Reset Request</h2>
            <p style="color: #64748b;">Hi ${user.name},</p>
            <p style="color: #64748b;">Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset My Password</a>
            </div>
            <p style="color: #94a3b8; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>
      `
    });

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
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