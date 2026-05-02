const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { pool } = require('../db');
const { requireAuth, attachUser } = require('../middleware/auth');

// POST /api/payments/create-checkout
router.post('/create-checkout', requireAuth, attachUser, async (req, res) => {
  try {
    const user = req.user;

    // Create or retrieve Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { clerk_id: user.clerk_id, user_id: String(user.id) },
      });
      customerId = customer.id;
      await pool.query(
        'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
        [customerId, user.id]
      );
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PREMIUM_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: { user_id: String(user.id) },
    });

    res.json({ success: true, checkoutUrl: session.url });
  } catch (err) {
    console.error('create-checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/payments/create-portal
router.post('/create-portal', requireAuth, attachUser, async (req, res) => {
  try {
    const user = req.user;
    if (!user.stripe_customer_id) {
      return res.status(400).json({ error: 'No billing account found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ success: true, portalUrl: session.url });
  } catch (err) {
    console.error('create-portal error:', err);
    res.status(500).json({ error: 'Failed to open billing portal' });
  }
});

// POST /api/payments/webhook (Stripe)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature error:', err);
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  console.log(`💳 Stripe webhook: ${event.type}`);

  try {
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const status = subscription.status;

      if (status === 'active') {
        await pool.query(
          `UPDATE users SET plan = 'premium', stripe_subscription_id = $1, updated_at = NOW() 
           WHERE stripe_customer_id = $2`,
          [subscription.id, customerId]
        );
        console.log(`✅ User upgraded to premium: ${customerId}`);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      await pool.query(
        `UPDATE users SET plan = 'free', credits = 10, stripe_subscription_id = NULL, updated_at = NOW() 
         WHERE stripe_customer_id = $1`,
        [customerId]
      );
      console.log(`⬇️ User downgraded to free: ${customerId}`);
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      console.log(`❌ Payment failed for customer: ${invoice.customer}`);
      // Could send email notification here
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
