const mongoose = require('mongoose');

const RevenueSegmentSchema = new mongoose.Schema({
  segmentName: { 
    type: String, 
    required: true, 
    enum: ['Tuition Fees', 'Transport', 'Activities', 'Grants & Subsidies', 'Facility & Capacity'] 
  },
  campus: { type: String, required: true }, // e.g. "Oakridge Main Campus", "St. Jude North", "Horizon East"
  academicYear: { type: String, default: '2025-2026' },
  month: { type: String, required: true }, // "Jan", "Feb", etc. or "YYYY-MM"
  actualRevenue: { type: Number, required: true },
  budgetRevenue: { type: Number, required: true },
  forecastRevenue: { type: Number, required: true },
  actualCost: { type: Number, required: true },
  contributionMargin: { type: Number, required: true },
  marginPercentage: { type: Number, required: true },
  capacityUtilizationRate: { type: Number, default: 85 }, // percentage 0-100
  enrolledCount: { type: Number, default: 0 },
  totalCapacity: { type: Number, default: 0 },
  category: { type: String, default: 'Core' }
}, { timestamps: true });

module.exports = mongoose.model('RevenueSegment', RevenueSegmentSchema);
