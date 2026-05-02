const express = require('express');
const router = express.Router();
const { Webhook } = require('svix');
const { pool } = require('../db');

// POST /api/webhooks/clerk
// Syncs Clerk users to PostgreSQL
router.post('/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(500).json({ error: 'Clerk webhook secret not configured' });
  }

  const svix_id = req.headers['svix-id'];
  const svix_timestamp = req.headers['svix-timestamp'];
  const svix_signature = req.headers['svix-signature'];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  let event;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(req.body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Clerk webhook verification failed:', err);
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const { type, data } = event;
  console.log(`📨 Clerk webhook: ${type}`);

  try {
    if (type === 'user.created') {
      const { id: clerkId, email_addresses, first_name, last_name } = data;
      const email = email_addresses[0]?.email_address;
      const name = `${first_name || ''} ${last_name || ''}`.trim();

      await pool.query(
        `INSERT INTO users (clerk_id, email, name, plan, credits) 
         VALUES ($1, $2, $3, 'free', 10) 
         ON CONFLICT (clerk_id) DO NOTHING`,
        [clerkId, email, name]
      );
      console.log(`✅ User created: ${email}`);
    }

    if (type === 'user.updated') {
      const { id: clerkId, email_addresses, first_name, last_name } = data;
      const email = email_addresses[0]?.email_address;
      const name = `${first_name || ''} ${last_name || ''}`.trim();

      await pool.query(
        `UPDATE users SET email = $2, name = $3, updated_at = NOW() 
         WHERE clerk_id = $1`,
        [clerkId, email, name]
      );
    }

    if (type === 'user.deleted') {
      const { id: clerkId } = data;
      await pool.query('DELETE FROM users WHERE clerk_id = $1', [clerkId]);
      console.log(`🗑️ User deleted: ${clerkId}`);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Clerk webhook processing error:', err);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

module.exports = router;
