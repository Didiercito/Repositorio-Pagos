import * as amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

export const rabbitSettings = {
  url: process.env.RABBITMQ_URL || 'amqp://localhost',
  exchange: process.env.RABBITMQ_EXCHANGE || 'auth_events',
  queues: {
    payments: 'payments_kitchen_sync_queue',
  },
  routingKeys: {
    listen: 'kitchen.admin.registered',
    publish: 'payment.kitchen.created',
  },
};

class RabbitMQ {
  connection: any = null;
  channel: any = null;

  async connect() {
    if (this.channel) return;
    try {
      console.log('🐇 Conectando a RabbitMQ...');
      
      this.connection = await amqp.connect(rabbitSettings.url);
      
      if (this.connection) {
        this.channel = await this.connection.createChannel();
        
        if (this.channel) {
          await this.channel.assertExchange(rabbitSettings.exchange, 'topic', { durable: true });
          console.log('✅ RabbitMQ Conectado en Pagos');
        }
      }

    } catch (error) {
      console.error('❌ Error conectando a RabbitMQ:', error);
    }
  }

  async publish(routingKey: string, message: any) {
    if (!this.channel) await this.connect();
    
    this.channel?.publish(
      rabbitSettings.exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    console.log(`📤 Evento enviado: ${routingKey}`);
  }
}

export const rabbitMQ = new RabbitMQ();