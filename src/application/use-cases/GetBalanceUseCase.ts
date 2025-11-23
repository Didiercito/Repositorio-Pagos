import { IPaymentRepository } from '../../domain/repositories/IPaymentRepository';

export class GetBalanceUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute() {
    const balance = await this.paymentRepository.getBalance();

  }
}