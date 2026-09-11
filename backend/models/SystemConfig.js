const mongoose = require('mongoose');

const SystemConfigSchema = new mongoose.Schema({
  configKey: { type: String, required: true, unique: true },
  configValue: { type: mongoose.Schema.Types.Mixed, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Pricing & Discounts', 'AI Thresholds', 'Governance & Safeguarding', 'Integrations'], 
    default: 'Pricing & Discounts' 
  },
  lastModifiedBy: { type: String, default: 'System Admin' }
}, { timestamps: true });

module.exports = mongoose.model('SystemConfig', SystemConfigSchema);
