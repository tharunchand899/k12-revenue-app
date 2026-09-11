const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  quoteNumber: { type: String, required: true, unique: true },
  studentName: { type: String, required: true },
  guardianName: { type: String, required: true },
  campus: { type: String, required: true },
  segment: { type: String, required: true },
  itemDescription: { type: String, required: true },
  basePrice: { type: Number, required: true },
  requestedDiscountPercent: { type: Number, required: true },
  offeredPrice: { type: Number, required: true },
  costBasis: { type: Number, required: true },
  projectedMargin: { type: Number, required: true },
  projectedMarginPercent: { type: Number, required: true },
  dealScore: { type: Number, default: 85 }, // 0-100 score
  elasticityScore: { type: Number, default: -0.55 },
  marginLeakageAlert: { type: Boolean, default: false },
  leakageReason: { type: String, default: '' },
  approvalStatus: { 
    type: String, 
    enum: ['Pending Review', 'Approved', 'Rejected', 'Escalated'], 
    default: 'Pending Review' 
  },
  requestedBy: { type: String, required: true },
  approvedBy: { type: String, default: null },
  decisionNotes: { type: String, default: '' },
  cohortGroup: { type: String, default: 'Sibling Bundle 2025' },
  whatIfScenarioTag: { type: String, default: 'Standard Pricing' }
}, { timestamps: true });

module.exports = mongoose.model('Quote', QuoteSchema);
