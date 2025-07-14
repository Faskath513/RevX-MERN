const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../utils/mailer'); // Optional if you're using your own mailer

// 🔐 Register a new user
exports.register = async (req, res) => {
  const { username, email, password, role, employeeDetails, managerDetails, hrDetails } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or Email already exists' });
    }

    if (!['employee', 'manager', 'hr'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    if (role === 'employee' && !employeeDetails) {
      return res.status(400).json({ message: 'Employee details are required for the employee role' });
    }
    if (role === 'manager' && !managerDetails) {
      return res.status(400).json({ message: 'Manager details are required for the manager role' });
    }
    if (role === 'hr' && !hrDetails) {
      return res.status(400).json({ message: 'HR details are required for the HR role' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      employeeDetails: role === 'employee' ? employeeDetails : undefined,
      managerDetails: role === 'manager' ? managerDetails : undefined,
      hrDetails: role === 'hr' ? hrDetails : undefined,
    });

    await newUser.save();

    res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
      userId: newUser._id,
    });
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🔑 Login user
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '10d' }
    );

    let roleDetails = {};
    let roleMessage = '';

    if (user.role === 'hr') {
      roleDetails = user.hrDetails;
      roleMessage = 'HR login successful';
    } else if (user.role === 'manager') {
      roleDetails = user.managerDetails;
      roleMessage = 'Manager login successful';
    } else if (user.role === 'employee') {
      roleDetails = user.employeeDetails;
      roleMessage = 'Employee login successful';
    }

    res.status(200).json({
      message: roleMessage,
      token,
      id: user._id,
      username: user.username,
      role: user.role,
      roleDetails,
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/// ✉️ Request password reset (updated with better error handling)
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user doesn't exist for security
      return res.json({ message: 'If an account exists with this email, a reset link has been sent' });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link is valid for 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    res.json({ 
      success: true,
      message: 'If an account exists with this email, a reset link has been sent'
    });
  } catch (error) {
    console.error('Error sending reset email:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process reset request' 
    });
  }
};

// ✅ Confirm password reset (updated with password validation)
exports.confirmPasswordReset = async (req, res) => {
  const { token, newPassword } = req.body;

  // Basic password validation
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ 
      success: false,
      message: 'Password must be at least 8 characters long' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ 
      success: true,
      message: 'Password has been reset successfully' 
    });
  } catch (error) {
    console.error('Reset token error:', error.message);
    res.status(400).json({ 
      success: false,
      message: 'Invalid or expired token' 
    });
  }
};


// 🚪 Logout user
exports.logout = (req, res) => {
  try {
    res.setHeader('Set-Cookie', 'authToken=; Max-Age=0; path=/; HttpOnly; SameSite=Strict');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};