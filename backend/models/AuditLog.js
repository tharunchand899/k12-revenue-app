const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  actorName: { type: String, required: true },
  actorEmail: { type: String, required: true },
  actorRole: { type: String, required: true },
  action: { type: String, required: true }, // e.g. "OVERRIDE_AI_RECOMMENDATION", "APPROVE_DEAL", "EXPORT_REPORT"
  entityType: { type: String, required: true }, // e.g. "Recommendation", "Quote", "PriceList", "Auth"
  entityId: { type: String, default: 'N/A' },
  details: { type: String, required: true },
  previousState: { type: Object, default: null },
  newState: { type: Object, default: null },
  ipAddress: { type: String, default: '127.0.0.1' },
  status: { type: String, enum: ['Success', 'Failed'], default: 'Success' }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
