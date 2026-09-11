const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'k12_super_secret_jwt_key_2026_antigravity');
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user || !req.user.isActive) {
        return res.status(401).json({ error: 'User account deactivated or not found' });
      }
      return next();
    } catch (error) {
      console.error('JWT verification error:', error.message);
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }
};

const permitRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (req.user.role === 'Admin' || allowedRoles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ 
      error: `Access denied. Role '${req.user.role}' is not permitted for this action.` 
    });
  };
};

module.exports = { protect, permitRoles };
