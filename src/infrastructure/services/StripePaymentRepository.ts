import { stripe } from '../config/stripe';
import { IPaymentRepository, CreatePaymentDTO } from '../../domain/repositories/IPaymentRepository';
import { AccountBalance } from '../../domain/entities/AccountBalance';
import { PaymentTransaction } from '../../domain/entities/PaymentTransaction';
import Stripe from 'stripe';

export class StripePaymentRepository implements IPaymentRepository {
  
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

      return new AccountBalance(
        totalCentavos / 100, 
        0,                  
        'mxn'
      );

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
      const params: Stripe.PaymentIntentListParams = {
        limit: 100, 
      };

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
        new Date(pi.created * 1000)
      ));

    } catch (error) {
      console.error('Error en Stripe getTransactionHistory:', error);
      throw new Error('No se pudo obtener el historial de donaciones');
    }
  }

  async createCheckoutSession(data: CreatePaymentDTO): Promise<{ url: string }> {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: data.userEmail,
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
          description: `Donación de ${data.userName}`,
          metadata: {
            userId: data.userId,
            userName: data.userName,
            userEmail: data.userEmail,
            kitchenId: data.kitchenId,
            tipo: "Donación"
          }
        },
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
      });

      if (!session.url) {
        throw new Error('Stripe no devolvió la URL de la sesión');
      }

      return { url: session.url };

    } catch (error) {
      console.error('Error creando Checkout Session:', error);
      throw new Error('No se pudo generar el link de pago');
    }
  }
}