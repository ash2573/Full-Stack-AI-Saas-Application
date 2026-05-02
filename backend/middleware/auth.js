const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const { pool } = require('../db');

// Clerk authentication middleware
const requireAuth = ClerkExpressRequireAuth();

// Attach user from DB to request
// const attachUser = async (req, res, next) => {
//   try {
//     const clerkId = req.auth.userId;
//     if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

//     const result = await pool.query(
//       'SELECT * FROM users WHERE clerk_id = $1',
//       [clerkId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'User not found. Please sign in again.' });
//     }

//     req.user = result.rows[0];
//     next();
//   } catch (err) {
//     console.error('attachUser error:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

const attachUser = async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

    // Get user info from Clerk
    const { createClerkClient } = require('@clerk/clerk-sdk-node');
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    
    let result = await pool.query('SELECT * FROM users WHERE clerk_id = $1', [clerkId]);

    // Auto-create user if they don't exist
    if (result.rows.length === 0) {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0]?.emailAddress || '';
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';

      result = await pool.query(
        'INSERT INTO users (clerk_id, email, name, plan, credits) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (clerk_id) DO UPDATE SET email = $2, name = $3 RETURNING *',
        [clerkId, email, name, 'free', 10]
      );
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error('attachUser error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Check and deduct credits
const checkCredits = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.plan === 'premium') return next(); // unlimited

    if (user.credits <= 0) {
      return res.status(403).json({
        error: 'insufficient_credits',
        message: 'You have no credits remaining. Please upgrade to Premium.',
      });
    }

    next();
  } catch (err) {
    console.error('checkCredits error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Deduct 1 credit and log usage
const deductCredit = async (userId, toolName, inputSummary = '') => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      'SELECT plan, credits FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];

    if (user.plan !== 'premium') {
      await client.query(
        'UPDATE users SET credits = credits - 1, updated_at = NOW() WHERE id = $1',
        [userId]
      );
    }

    await client.query(
      'INSERT INTO usage_logs (user_id, tool_name, input_summary) VALUES ($1, $2, $3)',
      [userId, toolName, inputSummary.substring(0, 200)]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('deductCredit error:', err);
  } finally {
    client.release();
  }
};

module.exports = { requireAuth, attachUser, checkCredits, deductCredit };
