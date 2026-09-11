const express = require('express');
const router = express.Router();
const Recommendation = require('../models/Recommendation');
const { protect, permitRoles } = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/audit');
const { generatePricingRecommendation } = require('../services/aiService');

// @route GET /api/recommendations
router.get('/', protect, async (req, res) => {
  try {
    const { status, segment, campus } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (segment && segment !== 'All') filter.segment = segment;
    if (campus && campus !== 'All Campuses') filter.campus = campus;

    const items = await Recommendation.find(filter).sort({ createdAt: -1 });

    const totalPotentialUplift = items
      .filter(i => i.status === 'Pending Action' || i.status === 'Approved')
      .reduce((acc, i) => acc + (i.expectedFinancialImpact || 0), 0);

    res.json({
      items,
      stats: {
        totalPending: items.filter(i => i.status === 'Pending Action').length,
        totalApproved: items.filter(i => i.status === 'Approved').length,
        totalOverridden: items.filter(i => i.status === 'Overridden').length,
        totalPotentialUplift
      }
    });
  } catch (error) {
    console.error('Recommendations GET error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// @route POST /api/recommendations/generate
router.post('/generate', protect, permitRoles('Pricing Manager', 'Finance Controller', 'Admin'), async (req, res) => {
  try {
    const { segment = 'Tuition Fees', campus = 'Oakridge Main Campus', currentPrice = 12500, marginalCost = 4800, capacityUtilization = 92 } = req.body;

    const aiRes = await generatePricingRecommendation(segment, campus, currentPrice, marginalCost, capacityUtilization);

    const recId = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRec = await Recommendation.create({
      recommendationId: recId,
      title: `Optimize ${segment} Structure - ${campus}`,
      segment,
      campus,
      recommendationType: 'Price Adjustment',
      currentValue: `$${currentPrice.toLocaleString()} / yr`,
      recommendedValue: `$${aiRes.recommendedPrice.toLocaleString()} / yr (${aiRes.recommendedDiscount}% disc limit)`,
      expectedFinancialImpact: aiRes.expectedFinancialImpact,
      downsideRisk: Math.round(-aiRes.expectedFinancialImpact * 0.25),
      confidenceScore: aiRes.confidenceScore,
      confidenceInterval: {
        minUplift: aiRes.minUplift,
        maxUplift: aiRes.maxUplift
      },
      assumptions: aiRes.assumptions,
      constraints: aiRes.constraints,
      keyDrivers: aiRes.keyDrivers,
      explanation: aiRes.explanation,
      modelVersion: aiRes.modelVersion,
      status: 'Pending Action'
    });

    await logAuditEvent(req, 'GENERATE_AI_RECOMMENDATION', 'Recommendation', newRec._id, `Generated AI Recommendation ${recId} for ${segment}`);

    res.status(201).json(newRec);
  } catch (error) {
    console.error('Generate recommendation error:', error);
    res.status(500).json({ error: 'Failed to generate recommendation' });
  }
});

// @route POST /api/recommendations/:id/action
router.post('/:id/action', protect, permitRoles('Pricing Manager', 'Finance Controller', 'Executive', 'Admin'), async (req, res) => {
  try {
    const { action, overrideReason, revisedValue } = req.body; // action: 'Approved', 'Rejected', 'Overridden'
    const rec = await Recommendation.findById(req.params.id);

    if (!rec) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    if (action === 'Overridden' && (!overrideReason || overrideReason.trim().length < 5)) {
      return res.status(400).json({ error: 'A mandatory justification reason is required when overriding an AI recommendation.' });
    }

    const prevStatus = rec.status;
    rec.status = action;
    rec.reviewedBy = req.user.name;
    rec.reviewerRole = req.user.role;
    rec.reviewerDecision = action;
    rec.overrideReason = overrideReason || null;
    rec.executedAt = new Date();
    if (revisedValue) {
      rec.recommendedValue = `${revisedValue} (Human Override)`;
    }

    await rec.save();

    await logAuditEvent(
      req, 
      `AI_RECOMMENDATION_${action.toUpperCase()}`, 
      'Recommendation', 
      rec._id, 
      `User ${req.user.name} (${req.user.role}) marked recommendation ${rec.recommendationId} as ${action}. Reason: ${overrideReason || 'N/A'}`
    );

    res.json(rec);
  } catch (error) {
    console.error('Recommendation Action error:', error);
    res.status(500).json({ error: 'Failed to record decision' });
  }
});

module.exports = router;
