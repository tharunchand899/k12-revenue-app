const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', // Keeps local development working
    'https://k12-revenue-app.vercel.app/' // Allows your live Vercel app
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Database
connectDB();

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/pricing', require('./routes/pricingRoutes'));
app.use('/api/simulations', require('./routes/simulationRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/forecasts', require('./routes/forecastRoutes'));
app.use('/api/realized-impact', require('./routes/realizedImpactRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'K-12 Education Revenue & Pricing Intelligence Platform',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 K-12 Revenue Backend Server running on port ${PORT}`);
});
