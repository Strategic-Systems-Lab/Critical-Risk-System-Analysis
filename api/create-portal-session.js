// Vercel Serverless Function — creates a Stripe Customer Portal session,
// where Pro users can update payment details or cancel their subscription
// themselves, without us building that UI ourselves.
//
// Required environment variables:
//   STRIPE_SECRET_KEY (sk_test_...)

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customerId } = req.body || {};
  if (!customerId) {
    return res.status(400).json({ error: 'Missing customerId.' });
  }

  try {
    const origin = req.headers.origin || `https://${req.headers.host}`;
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/`,
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe portal session error:', err);
    return res.status(500).json({ error: 'Could not open subscription management. Please try again.' });
  }
}
