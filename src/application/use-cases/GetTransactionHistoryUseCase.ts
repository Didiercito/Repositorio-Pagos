import { IPaymentRepository } from '../../domain/repositories/IPaymentRepository';

interface GetTransactionHistoryOptions {
  page?: number;
  limit?: number;
  starting_after?: string;
}

export class GetTransactionHistoryUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(options: GetTransactionHistoryOptions = {}) {

  const limit = options.limit || 10; 
  const repoOptions: { limit: number; starting_after?: string } = {
    limit: limit,
  };

  if (options.starting_after) {
    repoOptions.starting_after = options.starting_after;
  }

  const transactions = await this.paymentRepository.getTransactionHistory(
    repoOptions
  );

  return transactions;
}
}