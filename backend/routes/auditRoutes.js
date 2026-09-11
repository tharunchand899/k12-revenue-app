const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const SystemConfig = require('../models/SystemConfig');
const { protect, permitRoles } = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/audit');

// @route GET /api/audit/logs
router.get('/logs', protect, async (req, res) => {
  try {
    const { action, role, search, entityType, page = 1, limit = 15 } = req.query;
    const filter = {};
    if (action && action !== 'All') filter.action = action;
    if (role && role !== 'All') filter.actorRole = role;
    if (entityType && entityType !== 'All') filter.entityType = entityType;
    if (search) {
      filter.$or = [
        { actorName: { $regex: search, $options: 'i' } },
        { actorEmail: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      logs,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Audit logs GET error:', error);
    res.status(500).json({ error: 'Failed to fetch audit log entries' });
  }
});

// @route GET /api/audit/settings
router.get('/settings', protect, async (req, res) => {
  try {
    const configs = await SystemConfig.find({});
    res.json(configs);
  } catch (error) {
    console.error('Settings GET error:', error);
    res.status(500).json({ error: 'Failed to fetch system configurations' });
  }
});

// @route PUT /api/audit/settings/:key
router.put('/settings/:key', protect, permitRoles('Admin', 'Finance Controller'), async (req, res) => {
  try {
    const { configValue } = req.body;
    const config = await SystemConfig.findOne({ configKey: req.params.key });

    if (!config) {
      return res.status(404).json({ error: 'Configuration parameter not found' });
    }

    const oldVal = config.configValue;
    config.configValue = configValue;
    config.lastModifiedBy = req.user.name;
    await config.save();

    await logAuditEvent(req, 'UPDATE_SYSTEM_CONFIG', 'SystemConfig', config._id, `Updated ${config.configKey} from ${oldVal} to ${configValue}`);

    res.json(config);
  } catch (error) {
    console.error('Settings PUT error:', error);
    res.status(500).json({ error: 'Failed to update system parameter' });
  }
});

module.exports = router;
