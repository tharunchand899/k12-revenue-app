const AuditLog = require('../models/AuditLog');

const logAuditEvent = async (req, action, entityType, entityId, details, previousState = null, newState = null) => {
  try {
    const actorName = req?.user?.name || 'System / Guest';
    const actorEmail = req?.user?.email || 'system@school.org';
    const actorRole = req?.user?.role || 'System';
    const ipAddress = req?.ip || req?.connection?.remoteAddress || '127.0.0.1';

    await AuditLog.create({
      actorName,
      actorEmail,
      actorRole,
      action,
      entityType,
      entityId: String(entityId || 'N/A'),
      details,
      previousState,
      newState,
      ipAddress,
      status: 'Success'
    });
  } catch (err) {
    console.error('Failed to log audit event:', err.message);
  }
};

module.exports = { logAuditEvent };
