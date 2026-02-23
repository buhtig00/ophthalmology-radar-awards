import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const body = await req.text();
    
    // Verify webhook signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Webhook event received:', event.type);

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const ticketId = session.metadata.ticket_id;
      const userEmail = session.metadata.user_email;

      console.log('Payment completed for ticket:', ticketId);

      // Update ticket as paid
      await base44.asServiceRole.entities.Ticket.update(ticketId, {
        paid: true,
        paid_at: new Date().toISOString(),
        stripe_payment_id: session.payment_intent,
      });

      // Send confirmation email
      try {
        const ticket = await base44.asServiceRole.entities.Ticket.get(ticketId);
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: userEmail,
          subject: '✅ Confirmación de compra - Ophthalmology Radar Awards 2026',
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #C9A227;">¡Pago confirmado!</h2>
              <p>Hemos recibido tu pago exitosamente.</p>
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Detalles de tu pase:</h3>
                <p><strong>Tipo:</strong> ${ticket.type_name}</p>
                <p><strong>Código:</strong> ${ticket.code}</p>
                <p><strong>Precio:</strong> €${(ticket.price / 100).toFixed(2)}</p>
              </div>
              <p>Guarda este email como confirmación. Te enviaremos más detalles sobre el evento próximamente.</p>
              <p style="color: #666; font-size: 12px; margin-top: 30px;">Ophthalmology Radar Awards 2026</p>
            </div>
          `
        });
        console.log('Confirmation email sent to:', userEmail);
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});