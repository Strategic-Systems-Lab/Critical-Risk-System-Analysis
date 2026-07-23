// Vercel Serverless Function — Stripe webhook receiver.
// This is the ONLY place that ever upgrades a user to Pro. The frontend
// never sets plan="pro" directly — it can only ask Stripe to start a
// checkout; Stripe tells US, via this signed webhook, whether it actually
// succeeded.
//
// Required environment variables (server-side only):
//   STRIPE_SECRET_KEY          (sk_test_...)
//   STRIPE_WEBHOOK_SECRET      (whsec_... — from the Stripe webhook setup)
//   VITE_SUPABASE_URL          (already set for the frontend, reused here)
//   SUPABASE_SERVICE_ROLE_KEY  (the SECRET key, not the anon key — this
//                                function must bypass Row Level Security
//                                to update another user's subscription row)

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Stripe needs the RAW request body to verify the signature — Vercel's
// default JSON body parser would break that, so it's disabled here.
export const config = { api: { bodyParser: false } };

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      // Checkout completed successfully — upgrade to Pro.
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.userId;
        if (!userId) { console.error('checkout.session.completed with no userId'); break; }
        const { error } = await supabaseAdmin.from('subscriptions').update({
          plan: 'pro',
          status: 'active',
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId);
        if (error) console.error('Failed to activate Pro plan:', error);
        break;
      }

      // Subscription renewed, changed, or entered a billing problem state.
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const status = sub.status === 'active' ? 'active' : (sub.status === 'past_due' ? 'past_due' : 'canceled');
        const { error } = await supabaseAdmin.from('subscriptions').update({
          status,
          plan: status === 'active' ? 'pro' : 'free',
          current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', sub.id);
        if (error) console.error('Failed to update subscription status:', error);
        break;
      }

      // Subscription canceled (immediately or at period end) — downgrade to Free.
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const { error } = await supabaseAdmin.from('subscriptions').update({
          plan: 'free',
          status: 'canceled',
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', sub.id);
        if (error) console.error('Failed to downgrade after cancellation:', error);
        break;
      }

      default:
        // Unhandled event types are fine to ignore — Stripe sends many
        // events we don't need to act on.
        break;
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    // Returning 500 tells Stripe to retry this event later.
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}
