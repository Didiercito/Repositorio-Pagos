import { Request, Response } from 'express';
import { stripe } from '../../config/stripe';
import Stripe from 'stripe';

class WebhookController {
  
  async handleWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
      if (!sig || !endpointSecret) {
        console.log('⚠️ Advertencia: Saltando verificación de firma (Solo Dev)');
        event = req.body; 
      } else {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`❌ Error de Webhook: ${errorMessage}`);
      return res.status(400).send(`Webhook Error: ${errorMessage}`);
    }
    
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const metadata = paymentIntent.metadata;
      const monto = paymentIntent.amount / 100; 
      
      console.log('\n¡PAGO CONFIRMADO (WEBHOOK)!');
      console.log(`Monto recibido: $${monto} ${paymentIntent.currency}`);
      

      if (metadata && metadata.userId) {
        console.log(`Usuario Identificado: ${metadata.userEmail} (ID: ${metadata.userId})`);
        console.log('Acción: El sistema ha registrado la donación exitosamente.');
      } else {
        console.log('❓ Pago anónimo o sin metadata de usuario.');
      }
      console.log('-------------------------------------------\n');
    }
    res.json({ received: true });
  }
}

export default new WebhookController();