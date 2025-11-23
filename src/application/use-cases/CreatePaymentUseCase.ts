import { IPaymentRepository, CreatePaymentDTO } from '../../domain/repositories/IPaymentRepository';

export class CreatePaymentUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(data: CreatePaymentDTO) {
    if (data.amount <= 0) {
      throw new Error("El monto del pago debe ser mayor a $0.00");
    }

    return await this.paymentRepository.createCheckoutSession(data);
  }
}