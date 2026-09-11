const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const User = require('./models/User');
const RevenueSegment = require('./models/RevenueSegment');
const PriceList = require('./models/PriceList');
const Quote = require('./models/Quote');
const Recommendation = require('./models/Recommendation');
const Forecast = require('./models/Forecast');
const RealizedImpact = require('./models/RealizedImpact');
const Notification = require('./models/Notification');
const AuditLog = require('./models/AuditLog');
const SystemConfig = require('./models/SystemConfig');

const seedData = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing existing database records...');
    await Promise.all([
      User.deleteMany({}),
      RevenueSegment.deleteMany({}),
      PriceList.deleteMany({}),
      Quote.deleteMany({}),
      Recommendation.deleteMany({}),
      Forecast.deleteMany({}),
      RealizedImpact.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      SystemConfig.deleteMany({})
    ]);

    console.log('👤 Seeding default users for all 5 role personas...');
    const users = [
      { name: 'Arthur Pendelton', email: 'admin@school.org', password: 'Admin123!', role: 'Admin', department: 'Executive Governance', schoolCampus: 'All Campuses' },
      { name: 'Eleanor Vance', email: 'executive@school.org', password: 'Executive123!', role: 'Executive', department: 'School Board Leadership', schoolCampus: 'All Campuses' },
      { name: 'Marcus Sterling', email: 'finance@school.org', password: 'Finance123!', role: 'Finance Controller', department: 'Finance & Treasury', schoolCampus: 'Oakridge Main Campus' },
      { name: 'Sophia Lin', email: 'pricing@school.org', password: 'Pricing123!', role: 'Pricing Manager', department: 'Revenue Optimization', schoolCampus: 'Oakridge Main Campus' },
      { name: 'David Miller', email: 'sales@school.org', password: 'Sales123!', role: 'Sales User', department: 'Admissions & Enrollment', schoolCampus: 'St. Jude North' }
    ];

    for (const u of users) {
      await User.create(u);
    }
    console.log('✅ Created 5 user personas (Admin, Executive, Finance Controller, Pricing Manager, Sales User)');

    console.log('📊 Seeding Revenue Segments across 5 K-12 streams...');
    const campuses = ['Oakridge Main Campus', 'St. Jude North', 'Horizon East'];
    const segments = ['Tuition Fees', 'Transport', 'Activities', 'Grants & Subsidies', 'Facility & Capacity'];
    const months = ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026'];

    const revItems = [];
    campuses.forEach(campus => {
      months.forEach(month => {
        // Tuition Fees
        revItems.push({
          segmentName: 'Tuition Fees',
          campus,
          month,
          actualRevenue: 1250000 + Math.floor(Math.random() * 80000),
          budgetRevenue: 1200000,
          forecastRevenue: 1280000,
          actualCost: 650000,
          contributionMargin: 600000,
          marginPercentage: 48,
          capacityUtilizationRate: 94,
          enrolledCount: 1450,
          totalCapacity: 1540
        });

        // Transport
        revItems.push({
          segmentName: 'Transport',
          campus,
          month,
          actualRevenue: 280000 + Math.floor(Math.random() * 20000),
          budgetRevenue: 300000,
          forecastRevenue: 290000,
          actualCost: 190000,
          contributionMargin: 90000,
          marginPercentage: 32,
          capacityUtilizationRate: 88,
          enrolledCount: 890,
          totalCapacity: 1000
        });

        // Activities
        revItems.push({
          segmentName: 'Activities',
          campus,
          month,
          actualRevenue: 115000 + Math.floor(Math.random() * 15000),
          budgetRevenue: 100000,
          forecastRevenue: 120000,
          actualCost: 68000,
          contributionMargin: 47000,
          marginPercentage: 41,
          capacityUtilizationRate: 79,
          enrolledCount: 420,
          totalCapacity: 530
        });

        // Grants
        revItems.push({
          segmentName: 'Grants & Subsidies',
          campus,
          month,
          actualRevenue: 85000,
          budgetRevenue: 85000,
          forecastRevenue: 85000,
          actualCost: 0,
          contributionMargin: 85000,
          marginPercentage: 100,
          capacityUtilizationRate: 100,
          enrolledCount: 300,
          totalCapacity: 300
        });

        // Facility & Capacity
        revItems.push({
          segmentName: 'Facility & Capacity',
          campus,
          month,
          actualRevenue: 140000 + Math.floor(Math.random() * 12000),
          budgetRevenue: 130000,
          forecastRevenue: 145000,
          actualCost: 36000,
          contributionMargin: 104000,
          marginPercentage: 74,
          capacityUtilizationRate: 72,
          enrolledCount: 18,
          totalCapacity: 25
        });
      });
    });

    await RevenueSegment.insertMany(revItems);

    console.log('🏷️ Seeding Price Lists & Cost Components...');
    await PriceList.insertMany([
      {
        name: 'Grade 9-10 Secondary Tuition & STEM Lab Fee',
        code: 'PL-SEC-G910',
        segment: 'Tuition Fees',
        campus: 'Oakridge Main Campus',
        gradeLevel: 'Secondary (Grade 9-10)',
        basePrice: 14500,
        unit: 'per Student / Year',
        fixedCostComponent: 4200,
        variableCostComponent: 2800,
        contributionMargin: 7500,
        marginPercentage: 52,
        maxDiscountPercent: 12,
        approvalStatus: 'Approved',
        approvedBy: 'Marcus Sterling',
        priceElasticity: -0.58,
        profitabilityTier: 'High Profitability'
      },
      {
        name: 'Zone 1 Express Bus Pass (Under 10km)',
        code: 'PL-TRN-Z1',
        segment: 'Transport',
        campus: 'Oakridge Main Campus',
        gradeLevel: 'K-12 General',
        basePrice: 2200,
        unit: 'per Route / Year',
        fixedCostComponent: 950,
        variableCostComponent: 550,
        contributionMargin: 700,
        marginPercentage: 32,
        maxDiscountPercent: 10,
        approvalStatus: 'Approved',
        approvedBy: 'Marcus Sterling',
        priceElasticity: -0.82,
        profitabilityTier: 'Moderate'
      },
      {
        name: 'After-School Robotics & AI Academy',
        code: 'PL-ACT-ROBO',
        segment: 'Activities',
        campus: 'St. Jude North',
        gradeLevel: 'Middle & High School',
        basePrice: 1200,
        unit: 'per Term',
        fixedCostComponent: 300,
        variableCostComponent: 250,
        contributionMargin: 650,
        marginPercentage: 54,
        maxDiscountPercent: 15,
        approvalStatus: 'Approved',
        approvedBy: 'Sophia Lin',
        priceElasticity: -0.45,
        profitabilityTier: 'High Profitability'
      },
      {
        name: 'Auditorium & Multi-Sports Arena Weekend Rental',
        code: 'PL-FAC-AUD',
        segment: 'Facility & Capacity',
        campus: 'Oakridge Main Campus',
        gradeLevel: 'External / Community',
        basePrice: 4500,
        unit: 'per Day Event',
        fixedCostComponent: 800,
        variableCostComponent: 400,
        contributionMargin: 3300,
        marginPercentage: 73,
        maxDiscountPercent: 20,
        approvalStatus: 'Approved',
        approvedBy: 'Eleanor Vance',
        priceElasticity: -0.35,
        profitabilityTier: 'High Profitability'
      }
    ]);

    console.log('📜 Seeding Quotes & Deal Approvals...');
    await Quote.insertMany([
      {
        quoteNumber: 'Q-2026-8801',
        studentName: 'Lucas Harrison (Grade 9)',
        guardianName: 'Dr. Robert Harrison',
        campus: 'Oakridge Main Campus',
        segment: 'Tuition Fees',
        itemDescription: 'Enrolment Package + STEM Tech Fee (Sibling Discount Request)',
        basePrice: 14500,
        requestedDiscountPercent: 18, // Triggers leakage alert! (>15%)
        offeredPrice: 11890,
        costBasis: 7000,
        projectedMargin: 4890,
        projectedMarginPercent: 41,
        dealScore: 64,
        elasticityScore: -0.58,
        marginLeakageAlert: true,
        leakageReason: 'Requested discount (18%) exceeds standard policy ceiling of 12%.',
        approvalStatus: 'Pending Review',
        requestedBy: 'David Miller (Sales)',
        cohortGroup: 'Sibling Enrolment 2026',
        whatIfScenarioTag: 'High Discount Request'
      },
      {
        quoteNumber: 'Q-2026-8802',
        studentName: 'Maya Patel (Grade 6)',
        guardianName: 'Anand Patel',
        campus: 'St. Jude North',
        segment: 'Tuition Fees',
        itemDescription: 'Standard Secondary Enrolment',
        basePrice: 12500,
        requestedDiscountPercent: 8,
        offeredPrice: 11500,
        costBasis: 6000,
        projectedMargin: 5500,
        projectedMarginPercent: 48,
        dealScore: 92,
        elasticityScore: -0.62,
        marginLeakageAlert: false,
        leakageReason: '',
        approvalStatus: 'Approved',
        requestedBy: 'David Miller (Sales)',
        approvedBy: 'Sophia Lin',
        cohortGroup: 'Early Bird Enrolment 2026',
        whatIfScenarioTag: 'Standard Pricing'
      }
    ]);

    console.log('🤖 Seeding AI Recommendations...');
    await Recommendation.insertMany([
      {
        recommendationId: 'REC-2026-101',
        title: 'Optimize Grade 9-10 Tuition & STEM Lab Fees',
        segment: 'Tuition Fees',
        campus: 'Oakridge Main Campus',
        recommendationType: 'Price Adjustment',
        currentValue: '$14,500 / yr (Standard rate)',
        recommendedValue: '$15,200 / yr (With 8% cap for existing siblings)',
        expectedFinancialImpact: 145000,
        downsideRisk: -22000,
        confidenceScore: 93,
        confidenceInterval: { minUplift: 110000, maxUplift: 178000 },
        assumptions: [
          'Secondary stream enrolment elasticity measured at -0.58 (Inelastic)',
          '94% capacity utilization rate provides strong pricing power',
          'Competitor fee benchmarks are +6% higher in Oakridge district'
        ],
        constraints: [
          'Board policy caps single-year fee growth at 8.5%',
          'Financial aid pool must retain 5% revenue reserve'
        ],
        keyDrivers: ['Capacity Utilization (94%)', 'Historical Elasticity (-0.58)', 'Direct STEM Cost Basis'],
        explanation: 'Oakridge Secondary Grade 9-10 stream is currently operating at 94% capacity. Given the low price elasticity (-0.58), a +4.8% price optimization yields an estimated $145,000 net revenue uplift with less than 1.2% attrition risk.',
        modelVersion: 'Gemini-3.6-EduPricer-v2.1',
        status: 'Pending Action'
      },
      {
        recommendationId: 'REC-2026-102',
        title: 'Restructure Transport Route Zones & Bus Pass Subsidies',
        segment: 'Transport',
        campus: 'St. Jude North',
        recommendationType: 'Discount Restructuring',
        currentValue: 'Flat $2,200 / Route Pass (20% unmetered promo discount)',
        recommendedValue: '$2,450 / Route Pass (Tiered by mileage: Zone 1 vs Zone 2)',
        expectedFinancialImpact: 68000,
        downsideRisk: -12000,
        confidenceScore: 88,
        confidenceInterval: { minUplift: 48000, maxUplift: 84000 },
        assumptions: ['Fuel cost inflation projected at 4.2%', 'Zone 2 routes require dedicated contractor shuttles'],
        constraints: ['Must provide 15% discount for multi-child bus riders'],
        keyDrivers: ['Fuel Cost Volatility', 'Route Occupancy Rate (88%)'],
        explanation: 'Transitioning from flat transport pricing to zone-based distance pricing eliminates $42,000 annual margin leakage on outer-suburb routes.',
        modelVersion: 'Gemini-3.6-EduPricer-v2.1',
        status: 'Approved',
        reviewedBy: 'Marcus Sterling',
        reviewerRole: 'Finance Controller',
        reviewerDecision: 'Approved',
        executedAt: new Date()
      }
    ]);

    console.log('📈 Seeding Revenue & Margin Forecasts...');
    await Forecast.insertMany([
      {
        forecastId: 'FC-2026-Q4',
        segment: 'Tuition Fees',
        campus: 'Oakridge Main Campus',
        forecastPeriod: 'Q4 2026',
        predictedRevenue: 3850000,
        predictedMargin: 1920000,
        predictedMarginPercent: 49.8,
        predictedCapacityUtilization: 95.2,
        priceSensitivityIndex: -0.58,
        propensityScore: 91.4,
        leakageRiskScore: 14.2,
        confidenceScore: 94,
        confidenceBands: { p10: 3620000, p50: 3850000, p90: 4100000 },
        contributingInputs: ['Early re-enrolment deposits (82%)', 'Historical retention rate (95%)', 'Local household income growth (+3.4%)'],
        explanationNarrative: 'Tuition revenue for Q4 2026 is projected to hit $3.85M with 49.8% contribution margin. Strong retention in primary grades buffers minor secondary stream shifts.',
        modelVersion: 'Gemini-Forecast-Pro-v3.0',
        hasDataWarning: false
      },
      {
        forecastId: 'FC-2026-TRN',
        segment: 'Transport',
        campus: 'Oakridge Main Campus',
        forecastPeriod: 'Q4 2026',
        predictedRevenue: 870000,
        predictedMargin: 280000,
        predictedMarginPercent: 32.1,
        predictedCapacityUtilization: 89.0,
        priceSensitivityIndex: -0.82,
        propensityScore: 78.5,
        leakageRiskScore: 28.5,
        confidenceScore: 87,
        confidenceBands: { p10: 790000, p50: 870000, p90: 940000 },
        contributingInputs: ['Bus capacity bookings', 'Diesel fuel price indices', 'Contractor vehicle lease rates'],
        explanationNarrative: 'Transport revenue is expected to reach $870K with steady 89% bus occupancy across 24 active municipal routes.',
        modelVersion: 'Gemini-Forecast-Pro-v3.0',
        hasDataWarning: false
      }
    ]);

    console.log('🎯 Seeding Realized Impact & Model Performance...');
    await RealizedImpact.insertMany([
      {
        impactId: 'IMP-2025-01',
        decisionTitle: '2025 Secondary STEM Fee Adjustment',
        recommendationId: 'REC-2025-88',
        segment: 'Tuition Fees',
        campus: 'Oakridge Main Campus',
        implementationDate: new Date('2025-09-01'),
        predictedUplift: 120000,
        realizedUplift: 132000,
        varianceAmount: 12000,
        accuracyPercentage: 96.8,
        modelDriftScore: 1.4,
        inferenceLatencyMs: 380,
        performanceStatus: 'Exceeded Target',
        userFeedbackRating: 5,
        userFeedbackText: 'AI prediction was spot on. Enrolment retained at 96% while generating $132k net incremental margin.',
        modelVersion: 'Gemini-3.6-EduPricer-v2.1'
      },
      {
        impactId: 'IMP-2025-02',
        decisionTitle: 'After-School Robotics Premium Pricing',
        recommendationId: 'REC-2025-92',
        segment: 'Activities',
        campus: 'St. Jude North',
        implementationDate: new Date('2025-10-15'),
        predictedUplift: 35000,
        realizedUplift: 33800,
        varianceAmount: -1200,
        accuracyPercentage: 96.5,
        modelDriftScore: 1.9,
        inferenceLatencyMs: 410,
        performanceStatus: 'On Track',
        userFeedbackRating: 5,
        userFeedbackText: 'High satisfaction rate among parents. Margin expanded from 38% to 54%.',
        modelVersion: 'Gemini-3.6-EduPricer-v2.1'
      }
    ]);

    console.log('🔔 Seeding Notifications...');
    await Notification.insertMany([
      {
        title: 'Margin Leakage Alert: Quote Q-2026-8801',
        message: 'Sales requested 18% discount for Lucas Harrison, exceeding authorized policy ceiling of 12%. Requires Pricing Manager approval.',
        type: 'Margin Leakage Alert',
        severity: 'urgent',
        targetRole: 'Pricing Manager',
        link: '/simulations'
      },
      {
        title: 'New AI Pricing Recommendation Available',
        message: 'Gemini AI engine generated a new pricing optimization for Grade 9-10 STEM fees (+4.8% net uplift proposal).',
        type: 'AI Recommendation',
        severity: 'info',
        targetRole: 'Finance Controller',
        link: '/recommendations'
      },
      {
        title: 'School Facility Capacity Threshold Exceeded',
        message: 'Oakridge Main Campus auditorium weekend bookings reached 96% capacity limit for Q4.',
        type: 'Capacity Warning',
        severity: 'warning',
        targetRole: 'Executive',
        link: '/dashboard'
      }
    ]);

    console.log('⚙️ Seeding System Settings...');
    await SystemConfig.insertMany([
      {
        configKey: 'MAX_AUTHORIZED_DISCOUNT_PCT',
        configValue: 15,
        description: 'Maximum discount percentage a Sales User can grant without mandatory manager approval.',
        category: 'Pricing & Discounts',
        lastModifiedBy: 'Marcus Sterling'
      },
      {
        configKey: 'TARGET_MINIMUM_MARGIN_PCT',
        configValue: 30,
        description: 'Contribution margin floor below which a margin leakage warning is triggered.',
        category: 'Pricing & Discounts',
        lastModifiedBy: 'Marcus Sterling'
      },
      {
        configKey: 'AI_CONFIDENCE_APPROVAL_THRESHOLD',
        configValue: 85,
        description: 'AI model confidence score required for auto-routing to fast-track executive review.',
        category: 'AI Thresholds',
        lastModifiedBy: 'Eleanor Vance'
      },
      {
        configKey: 'SAFEGUARDING_STUDENT_PRIVACY_MODE',
        configValue: 'STRICT_PII_MASKING',
        description: 'Enforces strict child privacy masking on all external AI prompts and exported reports.',
        category: 'Governance & Safeguarding',
        lastModifiedBy: 'Arthur Pendelton'
      }
    ]);

    console.log('📝 Seeding Audit Log history...');
    await AuditLog.insertMany([
      {
        actorName: 'Arthur Pendelton',
        actorEmail: 'admin@school.org',
        actorRole: 'Admin',
        action: 'SYSTEM_INITIALIZATION',
        entityType: 'System',
        entityId: 'SYS-INIT-2026',
        details: 'Initial system database setup and master security permissions configured.',
        ipAddress: '127.0.0.1',
        status: 'Success'
      },
      {
        actorName: 'Sophia Lin',
        actorEmail: 'pricing@school.org',
        actorRole: 'Pricing Manager',
        action: 'CREATE_PRICELIST',
        entityType: 'PriceList',
        entityId: 'PL-SEC-G910',
        details: 'Created Grade 9-10 Secondary Tuition fee structure ($14,500/yr).',
        ipAddress: '192.168.1.45',
        status: 'Success'
      }
    ]);

    console.log('🎉 Data seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedData();
