import { StripePaymentRepository } from '../../services/StripePaymentRepository';
import { GetBalanceUseCase } from '../../../application/use-cases/GetBalanceUseCase';
import { GetTransactionHistoryUseCase } from '../../../application/use-cases/GetTransactionHistoryUseCase';
import { CreatePaymentUseCase } from '../../../application/use-cases/CreatePaymentUseCase'; 
const paymentRepository = new StripePaymentRepository();

const getBalanceUseCase = new GetBalanceUseCase(paymentRepository);

const getTransactionHistoryUseCase = new GetTransactionHistoryUseCase(
  paymentRepository
);

const createPaymentUseCase = new CreatePaymentUseCase(paymentRepository);

export { 
  getBalanceUseCase, 
  getTransactionHistoryUseCase,
  createPaymentUseCase 
};