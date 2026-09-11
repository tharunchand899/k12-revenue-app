const express = require('express');
const router = express.Router();
const Quote = require('../models/Quote');
const PriceList = require('../models/PriceList');
const { protect, permitRoles } = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/audit');

// @route GET /api/simulations/quotes
router.get('/quotes', protect, async (req, res) => {
  try {
    const { status, campus, search } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.approvalStatus = status;
    if (campus && campus !== 'All Campuses') filter.campus = campus;
    if (search) {
      filter.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { quoteNumber: { $regex: search, $options: 'i' } },
        { guardianName: { $regex: search, $options: 'i' } }
      ];
    }

    const quotes = await Quote.find(filter).sort({ createdAt: -1 });
    res.json(quotes);
  } catch (error) {
    console.error('Quotes GET error:', error);
    res.status(500).json({ error: 'Failed to fetch deal quotes' });
  }
});

// @route POST /api/simulations/quotes
router.post('/quotes', protect, async (req, res) => {
  try {
    const { studentName, guardianName, campus, segment, itemDescription, basePrice, requestedDiscountPercent, costBasis, cohortGroup } = req.body;

    const base = Number(basePrice);
    const discountPct = Number(requestedDiscountPercent);
    const offeredPrice = base * (1 - discountPct / 100);
    const cost = Number(costBasis) || base * 0.45;
    const margin = offeredPrice - cost;
    const marginPercent = offeredPrice ? Math.round((margin / offeredPrice) * 100) : 0;

    // Check margin leakage trigger: discount > 15% OR margin < 30%
    const isLeakage = discountPct > 15 || marginPercent < 30;
    const leakageReason = isLeakage 
      ? (discountPct > 15 ? `Discount (${discountPct}%) exceeds authorized policy threshold of 15%.` : `Net margin (${marginPercent}%) falls below target 30% floor.`)
      : '';

    const quoteNumber = `Q-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newQuote = await Quote.create({
      quoteNumber,
      studentName,
      guardianName,
      campus,
      segment: segment || 'Tuition Fees',
      itemDescription,
      basePrice: base,
      requestedDiscountPercent: discountPct,
      offeredPrice: Math.round(offeredPrice),
      costBasis: Math.round(cost),
      projectedMargin: Math.round(margin),
      projectedMarginPercent: marginPercent,
      dealScore: isLeakage ? 62 : 91,
      elasticityScore: -0.62,
      marginLeakageAlert: isLeakage,
      leakageReason,
      approvalStatus: isLeakage ? 'Pending Review' : 'Approved',
      requestedBy: req.user.name,
      approvedBy: isLeakage ? null : 'System Auto-Approve',
      cohortGroup: cohortGroup || 'Standard Enrolment 2026'
    });

    await logAuditEvent(req, 'CREATE_QUOTE', 'Quote', newQuote._id, `Created deal quote ${quoteNumber} for ${studentName}. Leakage Alert: ${isLeakage}`);

    res.status(201).json(newQuote);
  } catch (error) {
    console.error('Quote POST error:', error);
    res.status(500).json({ error: 'Failed to submit quote for evaluation' });
  }
});

// @route PUT /api/simulations/quotes/:id/decision
router.put('/quotes/:id/decision', protect, permitRoles('Pricing Manager', 'Finance Controller', 'Admin'), async (req, res) => {
  try {
    const { approvalStatus, decisionNotes } = req.body; // 'Approved', 'Rejected', 'Escalated'
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    const oldStatus = quote.approvalStatus;
    quote.approvalStatus = approvalStatus;
    quote.approvedBy = req.user.name;
    quote.decisionNotes = decisionNotes || '';
    await quote.save();

    await logAuditEvent(req, 'DEAL_DECISION', 'Quote', quote._id, `Updated deal quote ${quote.quoteNumber} from ${oldStatus} to ${approvalStatus}. Notes: ${decisionNotes}`);

    res.json(quote);
  } catch (error) {
    console.error('Quote Decision error:', error);
    res.status(500).json({ error: 'Failed to record deal decision' });
  }
});

// @route POST /api/simulations/what-if
router.post('/what-if', protect, async (req, res) => {
  try {
    const { basePrice, priceChangePercent, discountPercent, currentEnrolment, elasticity = -0.65, costPerStudent } = req.body;

    const pChange = Number(priceChangePercent) || 0;
    const disc = Number(discountPercent) || 0;
    const base = Number(basePrice) || 10000;
    const initialEnrolment = Number(currentEnrolment) || 500;
    const cost = Number(costPerStudent) || 4000;

    const netPriceOld = base;
    const netPriceNew = base * (1 + pChange / 100) * (1 - disc / 100);

    // Quantity change based on elasticity: % Change in Demand = Elasticity * % Change in Net Price
    const netPricePercentChange = ((netPriceNew - netPriceOld) / netPriceOld) * 100;
    const demandPercentChange = elasticity * netPricePercentChange;
    const newEnrolment = Math.round(initialEnrolment * (1 + demandPercentChange / 100));

    const oldTotalRevenue = initialEnrolment * netPriceOld;
    const newTotalRevenue = newEnrolment * netPriceNew;

    const oldTotalMargin = initialEnrolment * (netPriceOld - cost);
    const newTotalMargin = newEnrolment * (netPriceNew - cost);

    const revenueVariance = newTotalRevenue - oldTotalRevenue;
    const marginVariance = newTotalMargin - oldTotalMargin;

    res.json({
      originalScenario: {
        price: netPriceOld,
        enrolment: initialEnrolment,
        totalRevenue: oldTotalRevenue,
        totalMargin: oldTotalMargin,
        marginPercent: Math.round((oldTotalMargin / oldTotalRevenue) * 100)
      },
      simulatedScenario: {
        price: Math.round(netPriceNew),
        enrolment: newEnrolment,
        totalRevenue: Math.round(newTotalRevenue),
        totalMargin: Math.round(newTotalMargin),
        marginPercent: Math.round((newTotalMargin / newTotalRevenue) * 100)
      },
      variance: {
        enrolmentDelta: newEnrolment - initialEnrolment,
        revenueVariance: Math.round(revenueVariance),
        marginVariance: Math.round(marginVariance),
        revenueVariancePct: Math.round((revenueVariance / oldTotalRevenue) * 100)
      },
      insights: `A net price change of ${netPricePercentChange.toFixed(1)}% yields a predicted enrolment adjustment of ${demandPercentChange.toFixed(1)}% (Elasticity = ${elasticity}). Expected net annual margin impact: $${Math.round(marginVariance).toLocaleString()}.`
    });
  } catch (error) {
    console.error('What-if error:', error);
    res.status(500).json({ error: 'Failed to run what-if simulation' });
  }
});

module.exports = router;
