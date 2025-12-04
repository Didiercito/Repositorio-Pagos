import { rabbitMQ, rabbitSettings } from '../config/rabbitmq';
import { stripe } from '../config/stripe';

export class KitchenRegisteredConsumer {
  async start() {
    await rabbitMQ.connect();
    const channel = rabbitMQ.channel;

    if (!channel) return;

    await channel.assertQueue(rabbitSettings.queues.payments, { durable: true });
    
    await channel.bindQueue(
      rabbitSettings.queues.payments,
      rabbitSettings.exchange,
      rabbitSettings.routingKeys.listen
    );

    console.log(`👂 Escuchando eventos en: ${rabbitSettings.queues.payments}`);

    channel.consume(rabbitSettings.queues.payments, async (msg: any) => {
      if (!msg) return;

      try {
        const data = JSON.parse(msg.content.toString());
        console.log('📥 [Saga Step 2] Evento recibido de Kitchen:', data);

        const { kitchenId, email, names, firstLastName } = data;

        const customer = await stripe.customers.create({
          email: email,
          name: `${names} ${firstLastName}`,
          metadata: {
            kitchenId: String(kitchenId),
            role: 'Admin_cocina',
            source: 'Saga Integration'
          }
        });

        console.log(`✅ Cliente Stripe creado: ${customer.id} para Cocina ID: ${kitchenId}`);

        const responsePayload = {
          kitchenId: kitchenId,
          stripeCustomerId: customer.id,
          status: 'active'
        };

        await rabbitMQ.publish(rabbitSettings.routingKeys.publish, responsePayload);

        // Confirmar procesado
        channel.ack(msg);
      } catch (error) {
        console.error('❌ Error procesando evento Saga:', error);
        channel.ack(msg); 
      }
    });
  }
}