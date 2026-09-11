const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/audit');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'k12_super_secret_jwt_key_2026_antigravity', {
    expiresIn: '7d'
  });
};

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, schoolCampus } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const validRole = ['Sales User', 'Pricing Manager', 'Finance Controller', 'Executive', 'Admin'].includes(role) 
      ? role 
      : 'Pricing Manager';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: validRole,
      department: department || 'Revenue Management',
      schoolCampus: schoolCampus || 'Oakridge Main Campus'
    });
console.log(user);
    const token = generateToken(user._id);
    await logAuditEvent({ user }, 'REGISTER', 'User', user._id, `New user registered: ${user.email} (${user.role})`);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        schoolCampus: user.schoolCampus
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated. Contact Administrator.' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    await logAuditEvent({ user }, 'LOGIN', 'User', user._id, `User logged in successfully`);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        schoolCampus: user.schoolCampus
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during authentication' });
  }
});

// @route GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department,
      schoolCampus: req.user.schoolCampus,
      lastLogin: req.user.lastLogin
    }
  });
});

module.exports = router;
