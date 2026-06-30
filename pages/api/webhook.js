import Stripe from 'stripe';
import { writeClient } from '../../lib/client';
import { Buffer } from 'buffer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

// Next.js requires disabling the bodyParser to read raw request streams for Stripe webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to read the raw request stream
async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const signature = req.headers['stripe-signature'];
    let event;

    try {
      const reqBuffer = await buffer(req);
      event = stripe.webhooks.constructEvent(
        reqBuffer,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`❌ Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      try {
        // Retrieve session and expand the line_items to see what products were purchased
        const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
          session.id,
          {
            expand: ['line_items'],
          }
        );
        const lineItems = sessionWithLineItems.line_items.data;

        // Build the Sanity order document
        const orderDoc = {
          _type: 'order',
          customerName: session.customer_details?.name || 'Guest Customer',
          email: session.customer_details?.email || 'No email provided',
          phoneNumber: session.customer_details?.phone || 'No phone provided',
          totalPrice: session.amount_total / 100, // Stripe converts currency to cents
          stripeSessionId: session.id,
          paymentStatus: session.payment_status === 'paid' ? 'Paid' : 'Pending',
          cartItems: lineItems.map((item) => ({
            _key: item.id, // Sanity requires a unique key for array objects
            _type: 'cartItem',
            name: item.description,
            price: item.price.unit_amount / 100,
            quantity: item.quantity,
          })),
        };

        // Write the document to Sanity Studio
        await writeClient.create(orderDoc);
        console.log(`✅ Order successfully saved to Sanity! Session ID: ${session.id}`);

      } catch (error) {
        console.error(`❌ Error writing order to Sanity:`, error);
        return res.status(500).json({ error: 'Failed to record order details.' });
      }
    }

    res.json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
