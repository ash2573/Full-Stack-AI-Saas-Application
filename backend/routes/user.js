const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { requireAuth, attachUser } = require('../middleware/auth');

// GET /api/user/credits
router.get('/credits', requireAuth, attachUser, async (req, res) => {
  try {
    const user = req.user;
    const usageResult = await pool.query(
      `SELECT tool_name, COUNT(*) as count 
       FROM usage_logs WHERE user_id = $1 
       GROUP BY tool_name ORDER BY count DESC`,
      [user.id]
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        credits: user.plan === 'premium' ? 'unlimited' : user.credits,
        stripeCustomerId: user.stripe_customer_id,
      },
      usageStats: usageResult.rows,
    });
  } catch (err) {
    console.error('get credits error:', err);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// GET /api/user/history
router.get('/history', requireAuth, attachUser, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT tool_name, input_summary, credits_used, created_at 
       FROM usage_logs WHERE user_id = $1 
       ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );

    res.json({ success: true, history: result.rows });
  } catch (err) {
    console.error('get history error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;
