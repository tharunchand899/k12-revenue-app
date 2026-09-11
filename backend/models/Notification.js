const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Approval Request', 'Margin Leakage Alert', 'AI Recommendation', 'Capacity Warning', 'System Event'], 
    default: 'Approval Request' 
  },
  severity: { 
    type: String, 
    enum: ['info', 'warning', 'urgent', 'critical'], 
    default: 'info' 
  },
  targetRole: { type: String, default: 'All' },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  link: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
