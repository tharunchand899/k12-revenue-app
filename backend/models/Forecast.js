const mongoose = require('mongoose');

const ForecastSchema = new mongoose.Schema({
  forecastId: { type: String, required: true, unique: true },
  segment: { type: String, required: true },
  campus: { type: String, required: true },
  forecastPeriod: { type: String, required: true },
  predictedRevenue: { type: Number, required: true },
  predictedMargin: { type: Number, required: true },
  predictedMarginPercent: { type: Number, required: true },
  predictedCapacityUtilization: { type: Number, required: true },
  priceSensitivityIndex: { type: Number, required: true }, // elasticity e.g. -0.58
  propensityScore: { type: Number, required: true }, // 0-100 retention/enrollment propensity
  leakageRiskScore: { type: Number, required: true }, // 0-100 margin leakage risk
  confidenceScore: { type: Number, required: true },
  confidenceBands: {
    p10: { type: Number, required: true },
    p50: { type: Number, required: true },
    p90: { type: Number, required: true }
  },
  contributingInputs: [{ type: String }],
  explanationNarrative: { type: String, required: true },
  modelVersion: { type: String, default: 'Gemini-Forecast-Pro-v3.0' },
  hasDataWarning: { type: Boolean, default: false },
  warningReason: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Forecast', ForecastSchema);
