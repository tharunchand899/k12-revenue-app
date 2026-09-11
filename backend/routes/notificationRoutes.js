const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route GET /api/notifications
router.get('/', protect, async (req, res) => {
  try {
    const { type, severity, unreadOnly } = req.query;
    const filter = {};
    if (type && type !== 'All') filter.type = type;
    if (severity && severity !== 'All') filter.severity = severity;
    if (unreadOnly === 'true') filter.isRead = false;

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Notifications GET error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// @route PUT /api/notifications/:id/read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ error: 'Notification not found' });

    notif.isRead = true;
    notif.readAt = new Date();
    await notif.save();

    const unreadCount = await Notification.countDocuments({ isRead: false });
    res.json({ notification: notif, unreadCount });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// @route PUT /api/notifications/mark-all-read
router.put('/mark-all-read', protect, async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true, readAt: new Date() });
    res.json({ message: 'All notifications marked as read', unreadCount: 0 });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to mark notifications read' });
  }
});

// @route DELETE /api/notifications/clear-all
router.delete('/clear-all', protect, async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ message: 'All notifications cleared', unreadCount: 0 });
  } catch (error) {
    console.error('Clear notifications error:', error);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

module.exports = router;
