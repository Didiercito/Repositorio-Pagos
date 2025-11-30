import { IPaymentRepository } from '../../domain/repositories/IPaymentRepository';

export class GetBalanceUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(kitchenId?: string) {
    return await this.paymentRepository.getBalance(kitchenId);
  }
}