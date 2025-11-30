import { IPaymentRepository } from '../../domain/repositories/IPaymentRepository';

interface GetTransactionHistoryOptions {
  limit?: number;
  starting_after?: string;
  kitchenId?: string;
}

export class GetTransactionHistoryUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(options: GetTransactionHistoryOptions = {}) {
    const limit = options.limit || 10;
    
    const repoOptions: { 
      limit: number; 
      starting_after?: string; 
      kitchenId?: string 
    } = {
      limit: limit,
    };

    if (options.starting_after) {
      repoOptions.starting_after = options.starting_after;
    }

    if (options.kitchenId) {
      repoOptions.kitchenId = options.kitchenId;
    }

    return await this.paymentRepository.getTransactionHistory(repoOptions);
  }
}