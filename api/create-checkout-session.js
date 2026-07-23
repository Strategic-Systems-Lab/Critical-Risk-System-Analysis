// Vercel Serverless Function — runs on the server, never in the browser.
// Creates a Stripe Checkout Session and returns its URL for redirect.
//
// Required environment variables (server-side only, NOT VITE_-prefixed):
//   STRIPE_SECRET_KEY       (sk_test_... in test mode)
//   STRIPE_PRICE_MONTHLY    (price_... — the €8.99/mo Price ID from Stripe)
//   STRIPE_PRICE_YEARLY     (price_... — the €59.99/yr Price ID from Stripe)

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { billingCycle, userId, userEmail } = req.body || {};

  if (!userId || !userEmail) {
    return res.status(400).json({ error: 'Missing userId or userEmail — user must be signed in.' });
  }
  if (billingCycle !== 'monthly' && billingCycle !== 'yearly') {
    return res.status(400).json({ error: 'billingCycle must be "monthly" or "yearly".' });
  }

  const priceId = billingCycle === 'monthly' ? process.env.STRIPE_PRICE_MONTHLY : process.env.STRIPE_PRICE_YEARLY;
  if (!priceId) {
    console.error('Missing Stripe price ID env var for', billingCycle);
    return res.status(500).json({ error: 'Pricing is not configured correctly. Please try again later.' });
  }

  try {
    const origin = req.headers.origin || `https://${req.headers.host}`;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: { userId },
      subscription_data: { metadata: { userId } },
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancelled`,
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout session error:', err);
    return res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
}
