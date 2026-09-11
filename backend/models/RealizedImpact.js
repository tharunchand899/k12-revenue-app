const mongoose = require('mongoose');

const RealizedImpactSchema = new mongoose.Schema({
  impactId: { type: String, required: true, unique: true },
  decisionTitle: { type: String, required: true },
  recommendationId: { type: String, default: null },
  segment: { type: String, required: true },
  campus: { type: String, required: true },
  implementationDate: { type: Date, required: true },
  predictedUplift: { type: Number, required: true },
  realizedUplift: { type: Number, required: true },
  varianceAmount: { type: Number, required: true },
  accuracyPercentage: { type: Number, required: true },
  modelDriftScore: { type: Number, default: 2.1 }, // percentage drift
  inferenceLatencyMs: { type: Number, default: 420 },
  performanceStatus: { 
    type: String, 
    enum: ['Exceeded Target', 'On Track', 'Below Target'], 
    default: 'On Track' 
  },
  userFeedbackRating: { type: Number, min: 1, max: 5, default: 5 },
  userFeedbackText: { type: String, default: 'Dynamic price adjustment yielded expected margin without student churn.' },
  modelVersion: { type: String, default: 'Gemini-3.6-EduPricer-v2.1' }
}, { timestamps: true });

module.exports = mongoose.model('RealizedImpact', RealizedImpactSchema);
