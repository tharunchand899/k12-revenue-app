const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, permitRoles } = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/audit');

// @route GET /api/users
router.get('/', protect, permitRoles('Admin', 'Executive'), async (req, res) => {
  try {
    const { role, search, status } = req.query;
    const filter = {};
    if (role && role !== 'All') filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Users GET error:', error);
    res.status(500).json({ error: 'Failed to fetch users list' });
  }
});

// @route POST /api/users
router.post('/', protect, permitRoles('Admin'), async (req, res) => {
  try {
    const { name, email, password, role, department, schoolCampus } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'Pricing Manager',
      department: department || 'Revenue Management',
      schoolCampus: schoolCampus || 'Oakridge Main Campus'
    });

    await logAuditEvent(req, 'CREATE_USER', 'User', newUser._id, `Admin created user ${newUser.email} with role ${newUser.role}`);

    const userObj = newUser.toObject();
    delete userObj.password;
    res.status(201).json(userObj);
  } catch (error) {
    console.error('User create error:', error);
    res.status(500).json({ error: 'Failed to create user account' });
  }
});

// @route PUT /api/users/:id
router.put('/:id', protect, permitRoles('Admin'), async (req, res) => {
  try {
    const { role, department, schoolCampus, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const prevRole = user.role;
    if (role) user.role = role;
    if (department) user.department = department;
    if (schoolCampus) user.schoolCampus = schoolCampus;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();

    await logAuditEvent(req, 'UPDATE_USER_ROLE', 'User', user._id, `Updated user ${user.email}. Role changed from ${prevRole} to ${user.role}. Active: ${user.isActive}`);

    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

module.exports = router;
