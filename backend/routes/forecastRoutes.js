const express = require('express');
const router = express.Router();
const Forecast = require('../models/Forecast');
const { protect } = require('../middleware/auth');

// @route GET /api/forecasts
router.get('/', protect, async (req, res) => {
  try {
    const { segment, campus, period } = req.query;
    const filter = {};
    if (segment && segment !== 'All') filter.segment = segment;
    if (campus && campus !== 'All Campuses') filter.campus = campus;
    if (period) filter.forecastPeriod = period;

    const forecasts = await Forecast.find(filter).sort({ createdAt: -1 });

    const totalPredictedRevenue = forecasts.reduce((acc, f) => acc + f.predictedRevenue, 0);
    const avgMarginPercent = forecasts.length 
      ? Math.round(forecasts.reduce((acc, f) => acc + f.predictedMarginPercent, 0) / forecasts.length)
      : 42;
    const avgCapacityUtilization = forecasts.length 
      ? Math.round(forecasts.reduce((acc, f) => acc + f.predictedCapacityUtilization, 0) / forecasts.length)
      : 86;

    res.json({
      forecasts,
      summary: {
        totalPredictedRevenue,
        avgMarginPercent,
        avgCapacityUtilization,
        activeModelsCount: 3,
        lowConfidenceCount: forecasts.filter(f => f.confidenceScore < 80).length
      }
    });
  } catch (error) {
    console.error('Forecasts GET error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue and margin forecasts' });
  }
});

// @route GET /api/forecasts/simulate-state
router.get('/simulate-state/:stateType', protect, async (req, res) => {
  const { stateType } = req.params; // 'low-confidence', 'insufficient-data', 'unavailable-model'

  if (stateType === 'unavailable-model') {
    return res.status(503).json({
      error: 'AI Forecast Service Unavailable. Model instance (Gemini-Forecast-Pro-v3.0) is taking offline maintenance.',
      code: 'MODEL_UNAVAILABLE'
    });
  }

  if (stateType === 'insufficient-data') {
    return res.status(422).json({
      error: 'Insufficient historical data for selected segment & campus (minimum 12 months required for predictive confidence).',
      code: 'INSUFFICIENT_DATA'
    });
  }

  res.json({
    forecastId: 'FC-SIM-LOWCONF',
    segment: 'Grants & Subsidies',
    campus: 'Horizon East Campus',
    forecastPeriod: 'Q4 2026',
    predictedRevenue: 180000,
    predictedMargin: 95000,
    predictedMarginPercent: 52,
    predictedCapacityUtilization: 72,
    priceSensitivityIndex: -1.25,
    propensityScore: 48,
    leakageRiskScore: 68,
    confidenceScore: 54, // LOW CONFIDENCE STATE
    confidenceBands: { p10: 110000, p50: 180000, p90: 240000 },
    contributingInputs: ['Gov Subsidies Policy Draft 2026', 'Low historical sample size'],
    explanationNarrative: '⚠️ WARNING: Low prediction confidence (54%). High volatility in government grant approvals requires human controller review.',
    modelVersion: 'Gemini-Forecast-Pro-v3.0',
    hasDataWarning: true,
    warningReason: 'High variance in government subsidy policy parameters.'
  });
});

module.exports = router;
