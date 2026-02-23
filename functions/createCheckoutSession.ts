import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { ticketType, ticketId, userEmail } = await req.json();

    // Get event config for prices
    const configs = await base44.asServiceRole.entities.EventConfig.list();
    const eventConfig = configs[0];

    const price = ticketType === "streaming" 
      ? (eventConfig?.streaming_price_cents || 2900)
      : (eventConfig?.vip_price_cents || 15000);

    const productName = ticketType === "streaming" 
      ? "Pase Streaming - Gala Ophthalmology Radar Awards 2026"
      : "Pase VIP - Gala Ophthalmology Radar Awards 2026";

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: productName,
            description: ticketType === "streaming" 
              ? "Acceso completo a la transmisión en vivo de la gala"
              : "Entrada presencial VIP con todos los beneficios exclusivos"
          },
          unit_amount: price,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/BuyTicket?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/BuyTicket`,
      customer_email: userEmail,
      metadata: {
        ticket_id: ticketId,
        user_email: userEmail,
        ticket_type: ticketType,
        base44_app_id: Deno.env.get("BASE44_APP_ID")
      }
    });

    // Update ticket with session ID
    await base44.asServiceRole.entities.Ticket.update(ticketId, {
      stripe_session_id: session.id,
    });

    return Response.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});