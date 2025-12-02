import { stripe } from '../config/stripe';
import { IPaymentRepository, CreatePaymentDTO } from '../../domain/repositories/IPaymentRepository';
import { AccountBalance } from '../../domain/entities/AccountBalance';
import { PaymentTransaction } from '../../domain/entities/PaymentTransaction';
import Stripe from 'stripe';

// --- IMPORTS DE BASE DE DATOS ---
import { AppDataSource } from '../database/config/data-source';
import { PaymentEntity } from '../database/entities/Payment.entity';

export class StripePaymentRepository implements IPaymentRepository {
  
  // 1. Inicializamos el repositorio de la BD Local
  private dbRepository = AppDataSource.getRepository(PaymentEntity);

  private _toDomainBalance(stripeBalance: Stripe.Balance): AccountBalance {
    const availableAmount = stripeBalance.available[0] ? stripeBalance.available[0].amount / 100 : 0;
    const pendingAmount = stripeBalance.pending[0] ? stripeBalance.pending[0].amount / 100 : 0;
    const currency = stripeBalance.available[0] ? stripeBalance.available[0].currency : 'mxn';

    return new AccountBalance(availableAmount, pendingAmount, currency);
  }

  async getBalance(kitchenId?: string): Promise<AccountBalance> {
    try {
      if (!kitchenId) {
        const stripeBalance = await stripe.balance.retrieve();
        return this._toDomainBalance(stripeBalance);
      }
      
      const params: Stripe.PaymentIntentListParams = { limit: 100 };
      const paymentIntents = await stripe.paymentIntents.list(params);

      const misPagos = paymentIntents.data.filter(pi => 
        pi.metadata && 
        pi.metadata.kitchenId === kitchenId && 
        pi.status === 'succeeded'
      );

      const totalCentavos = misPagos.reduce((suma, pi) => suma + pi.amount, 0);

      return new AccountBalance(totalCentavos / 100, 0, 'mxn');

    } catch (error) {
      console.error('Error en Stripe getBalance:', error);
      throw new Error('No se pudo obtener el balance');
    }
  }

  async getTransactionHistory(options: {
    limit: number;
    starting_after?: string;
    kitchenId?: string;
  }): Promise<PaymentTransaction[]> {
    try {
      const params: Stripe.PaymentIntentListParams = { limit: 100 };

      if (options.starting_after) {
        params.starting_after = options.starting_after;
      }

      const paymentIntents = await stripe.paymentIntents.list(params);
      let filteredData = paymentIntents.data;
      
      if (options.kitchenId) {
        filteredData = filteredData.filter(pi => 
          pi.metadata && pi.metadata.kitchenId === options.kitchenId
        );
      }

      return filteredData.map(pi => new PaymentTransaction(
        pi.id,
        pi.amount / 100,
        pi.currency,
        pi.description,
        'charge',
        pi.status,
        new Date(pi.created * 1000),
        pi.metadata?.donorNames || null,
        pi.metadata?.donorFirstLastName || null,
        pi.metadata?.donorSecondLastName || null,
        pi.metadata?.donorEmail || null,
        pi.metadata?.donorPhone || null
      ));

    } catch (error) {
      console.error('Error en Stripe getTransactionHistory:', error);
      throw new Error('No se pudo obtener el historial de donaciones');
    }
  }

  async createCheckoutSession(data: CreatePaymentDTO): Promise<{ url: string }> {
    try {
      // 1. Crear sesión en Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: data.donorEmail,
        line_items: [
          {
            price_data: {
              currency: data.currency,
              product_data: {
                name: 'Donación Voluntaria',
                description: data.description || 'Gracias por tu apoyo',
              },
              unit_amount: Math.round(data.amount * 100),
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          description: `Donación de ${data.donorNames} ${data.donorFirstLastName}`,
          metadata: {
            userId: data.userId,
            kitchenId: data.kitchenId,
            tipo: "Donación",
            donorNames: data.donorNames,
            donorFirstLastName: data.donorFirstLastName,
            donorSecondLastName: data.donorSecondLastName,
            donorEmail: data.donorEmail,
            donorPhone: data.donorPhone
          }
        },
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
      });

      if (!session.url) throw new Error('Stripe no devolvió la URL');

      // --- 2. GUARDAR EN BASE DE DATOS LOCAL (NUEVO) ---
      const localPayment = this.dbRepository.create({
        stripeId: session.id,       // Guardamos el ID de sesión para rastrearlo
        amount: data.amount,
        currency: data.currency,
        status: 'pending',          // Inicialmente pendiente hasta que paguen
        kitchenId: data.kitchenId,
        donorName: `${data.donorNames} ${data.donorFirstLastName}`,
        donorEmail: data.donorEmail
      });

      await this.dbRepository.save(localPayment);
      console.log(`💾 Pago registrado en BD Local con ID: ${localPayment.id}`);
      // -------------------------------------------------

      return { url: session.url };

    } catch (error) {
      console.error('Error creando Checkout Session:', error);
      throw new Error('No se pudo generar el link de pago');
    }
  }
}