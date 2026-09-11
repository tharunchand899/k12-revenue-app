const express = require('express');
const router = express.Router();
const PriceList = require('../models/PriceList');
const { protect, permitRoles } = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/audit');

// @route GET /api/pricing
router.get('/', protect, async (req, res) => {
  try {
    const { search, segment, campus, approvalStatus, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;

    const filter = {};
    if (segment && segment !== 'All') filter.segment = segment;
    if (campus && campus !== 'All Campuses') filter.campus = campus;
    if (approvalStatus && approvalStatus !== 'All') filter.approvalStatus = approvalStatus;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { gradeLevel: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await PriceList.countDocuments(filter);
    const items = await PriceList.find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      items,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Pricing GET error:', error);
    res.status(500).json({ error: 'Failed to fetch price list records' });
  }
});

// @route POST /api/pricing
router.post('/', protect, permitRoles('Pricing Manager', 'Finance Controller', 'Admin'), async (req, res) => {
  try {
    const { name, code, segment, campus, gradeLevel, basePrice, unit, fixedCostComponent, variableCostComponent, maxDiscountPercent } = req.body;

    const totalCost = (Number(fixedCostComponent) || 0) + (Number(variableCostComponent) || 0);
    const contributionMargin = (Number(basePrice) || 0) - totalCost;
    const marginPercentage = basePrice ? Math.round((contributionMargin / basePrice) * 100) : 0;

    let tier = 'Moderate';
    if (marginPercentage > 40) tier = 'High Profitability';
    else if (marginPercentage < 15) tier = 'Low Profitability / Subsidized';

    const newItem = await PriceList.create({
      name,
      code,
      segment,
      campus,
      gradeLevel: gradeLevel || 'General K-12',
      basePrice: Number(basePrice),
      unit: unit || 'per Student / Year',
      fixedCostComponent: Number(fixedCostComponent) || 0,
      variableCostComponent: Number(variableCostComponent) || 0,
      contributionMargin,
      marginPercentage,
      maxDiscountPercent: Number(maxDiscountPercent) || 15,
      approvalStatus: req.user.role === 'Finance Controller' || req.user.role === 'Admin' ? 'Approved' : 'Pending Review',
      approvedBy: req.user.name,
      profitabilityTier: tier
    });

    await logAuditEvent(req, 'CREATE_PRICELIST', 'PriceList', newItem._id, `Created price list ${name} (${code}) with margin ${marginPercentage}%`);

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Pricing POST error:', error);
    res.status(500).json({ error: error.message || 'Failed to create price list entry' });
  }
});

// @route PUT /api/pricing/:id/approval
router.put('/:id/approval', protect, permitRoles('Pricing Manager', 'Finance Controller', 'Admin'), async (req, res) => {
  try {
    const { approvalStatus, notes } = req.body;
    const item = await PriceList.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Price list record not found' });
    }

    const prevStatus = item.approvalStatus;
    item.approvalStatus = approvalStatus;
    item.approvedBy = req.user.name;
    await item.save();

    await logAuditEvent(req, 'UPDATE_PRICELIST_APPROVAL', 'PriceList', item._id, `Changed approval status from ${prevStatus} to ${approvalStatus}. Notes: ${notes || 'None'}`);

    res.json(item);
  } catch (error) {
    console.error('Pricing Approval error:', error);
    res.status(500).json({ error: 'Failed to update approval status' });
  }
});

module.exports = router;
