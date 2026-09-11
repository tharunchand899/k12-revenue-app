const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
  recommendationId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  segment: { type: String, required: true },
  campus: { type: String, required: true },
  recommendationType: { 
    type: String, 
    enum: ['Price Adjustment', 'Discount Restructuring', 'Capacity Optimization', 'Subsidy Allocation', 'Margin Leakage Mitigation'], 
    default: 'Price Adjustment' 
  },
  currentValue: { type: String, required: true }, // e.g. "$12,000 / yr (10% discount)"
  recommendedValue: { type: String, required: true }, // e.g. "$13,200 / yr (5% discount)"
  expectedFinancialImpact: { type: Number, required: true }, // positive dollar revenue impact
  downsideRisk: { type: Number, default: -2500 }, // estimated max downside risk in $
  confidenceScore: { type: Number, required: true }, // percentage, e.g. 92
  confidenceInterval: {
    minUplift: { type: Number, required: true },
    maxUplift: { type: Number, required: true }
  },
  assumptions: [{ type: String }],
  constraints: [{ type: String }],
  keyDrivers: [{ type: String }],
  explanation: { type: String, required: true },
  modelVersion: { type: String, default: 'Gemini-3.6-EduPricer-v2.1' },
  sourceDataSnapshot: { type: Object, default: {} },
  status: { 
    type: String, 
    enum: ['Pending Action', 'Approved', 'Rejected', 'Overridden'], 
    default: 'Pending Action' 
  },
  reviewedBy: { type: String, default: null },
  reviewerRole: { type: String, default: null },
  reviewerDecision: { type: String, default: null },
  overrideReason: { type: String, default: null },
  executedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Recommendation', RecommendationSchema);
