import { AccountBalance } from '../entities/AccountBalance';
import { PaymentTransaction } from '../entities/PaymentTransaction';

export interface CreatePaymentDTO {
  amount: number;
  currency: string;
  userId: string;
  userEmail: string;
  userName: string;
  kitchenId: string;
  description?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface IPaymentRepository {

  getBalance(kitchenId?: string): Promise<AccountBalance>;

  getTransactionHistory(options: {
    limit: number;
    starting_after?: string;
    kitchenId?: string;
  }): Promise<PaymentTransaction[]>;

  createCheckoutSession(data: CreatePaymentDTO): Promise<{ url: string }>;
}