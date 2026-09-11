const mongoose = require('mongoose');

const PriceListSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Grade 9-10 Tuition & STEM Lab", "Zone 1 Express Bus Pass"
  code: { type: String, required: true, unique: true },
  segment: { 
    type: String, 
    required: true, 
    enum: ['Tuition Fees', 'Transport', 'Activities', 'Grants & Subsidies', 'Facility & Capacity'] 
  },
  campus: { type: String, required: true },
  gradeLevel: { type: String, default: 'K-12 General' }, // e.g. "Primary (1-5)", "Secondary (6-10)", "Senior Secondary (11-12)"
  basePrice: { type: Number, required: true },
  unit: { type: String, default: 'per Student / Year' }, // "per Student / Term", "per Route / Month", "per Hour"
  fixedCostComponent: { type: Number, required: true },
  variableCostComponent: { type: Number, required: true },
  contributionMargin: { type: Number, required: true },
  marginPercentage: { type: Number, required: true },
  maxDiscountPercent: { type: Number, default: 15 },
  approvalStatus: { 
    type: String, 
    enum: ['Draft', 'Pending Review', 'Approved', 'Rejected'], 
    default: 'Approved' 
  },
  approvedBy: { type: String, default: 'System Admin' },
  version: { type: String, default: 'v1.0' },
  isActive: { type: Boolean, default: true },
  priceElasticity: { type: Number, default: -0.65 }, // elasticity coefficient
  profitabilityTier: { type: String, enum: ['High Profitability', 'Moderate', 'Low Profitability / Subsidized'], default: 'High Profitability' }
}, { timestamps: true });

module.exports = mongoose.model('PriceList', PriceListSchema);
