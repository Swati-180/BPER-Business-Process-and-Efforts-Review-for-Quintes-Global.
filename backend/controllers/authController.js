const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// const nodemailer = require('nodemailer'); // removed dep

// Existing functions...
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, email: user.email, role: user.role, name: user.name, status: user.status } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// NEW: Request Access
exports.requestAccess = async (req, res) => {
  try {
    const { email, name, company, role } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists. Contact admin.' });
    }
    
    // Create pending user
    user = await User.create({
      name,
      email,
      password: await bcrypt.hash('TempPass123!', 12), // temp password
      role,
      company,
      status: 'pending'
    });
    
    // Send approval email to admin (implement email later)
    console.log(`New access request: ${email} - pending approval`);
    
    res.json({ message: 'Access request submitted. Admin will review shortly.', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};

exports.getAllUsers = async (req, res) => {
  const users = await User.find({}, 'name email role status department createdAt');
  res.json(users);
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role = 'employee' } = req.body;
    
    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    // Check if user already exists
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Create user with active status (no approval system)
    const user = await User.create({
      name,
      email,
      password, // Will be hashed by pre-save hook
      role,
      status: 'active', // Always active on registration
      isActive: true
    });
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        _id: user._id,
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

