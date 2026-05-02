require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');

// Import routes
const aiToolsRoutes = require('./routes/aiTools');
const imageToolsRoutes = require('./routes/imageTools');
const userRoutes = require('./routes/user');
const webhooksRoutes = require('./routes/webhooks');
const paymentsRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────

// Raw body for webhooks (must come BEFORE express.json())
app.use('/api/webhooks/clerk', express.raw({ type: 'application/json' }));
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// JSON body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
app.use(
  cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api', aiToolsRoutes);
app.use('/api', imageToolsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/payments', paymentsRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────

const start = async () => {
  await initDB();
  app.listen(PORT, () => {
    console.log(`🚀 QuickAI API running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

start().catch(console.error);
