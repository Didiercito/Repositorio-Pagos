import { Request, Response } from 'express';
import { GetBalanceUseCase } from '../../../application/use-cases/GetBalanceUseCase';
import { GetTransactionHistoryUseCase } from '../../../application/use-cases/GetTransactionHistoryUseCase';
import { CreatePaymentUseCase } from '../../../application/use-cases/CreatePaymentUseCase';

export class PaymentController {
  constructor(
    private readonly getBalanceUseCase: GetBalanceUseCase,
    private readonly getTransactionHistoryUseCase: GetTransactionHistoryUseCase,
    private readonly createPaymentUseCase: CreatePaymentUseCase
  ) {}

  private formatTransaction(tx: any) {
    const statusMap: Record<string, string> = {
      'succeeded': 'Exitoso ✅',
      'requires_payment_method': 'Pendiente ⏳',
      'canceled': 'Cancelado ❌',
      'processing': 'Procesando 🔄'
    };

    return {
      id: tx.id,
      monto: `$${tx.amount.toFixed(2)} ${tx.currency.toUpperCase()}`,
      descripcion: tx.description,
      estado: statusMap[tx.status] || tx.status,
      fecha: tx.created.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
      tipo: 'Donación'
    };
  }

  getBalance = async (req: Request, res: Response) => {
    try {
      const user = req.user;
      
      const kitchenId = user?.kitchenId; 

      const balance = await this.getBalanceUseCase.execute(kitchenId);
      
      res.status(200).json({ 
        success: true, 
        mensaje: kitchenId ? `Balance calculado para cocina ID: ${kitchenId}` : 'Balance Global (SuperAdmin)',
        data: balance 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Error al obtener el balance',
        error: errorMessage,
      });
    }
  };

  getTransactionHistory = async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const starting_after = req.query.starting_after as string | undefined;
      
      const user = req.user;
      
      const kitchenId = user?.kitchenId; 

      const options: any = { 
        limit, 
        kitchenId: kitchenId 
      };
      
      if (starting_after) {
        options.starting_after = starting_after;
      }

      const transactions = await this.getTransactionHistoryUseCase.execute(options);
      const datosBonitos = transactions.map(this.formatTransaction);

      res.status(200).json({ 
        success: true, 
        mensaje: kitchenId ? `Historial filtrado para cocina ID: ${kitchenId}` : 'Historial Global (SuperAdmin)',
        data: datosBonitos 
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Error al obtener el historial de transacciones',
        error: errorMessage,
      });
    }
  };

  createPayment = async (req: Request, res: Response) => {
    try {
      const { amount, currency, description, userName, kitchenId } = req.body;
      const user = req.user;

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'No se pudo identificar al usuario. Revisa tu token.' 
        });
      }

      if (!kitchenId) {
        return res.status(400).json({
          success: false,
          message: 'Falta el ID de la cocina (kitchenId) a la que deseas donar.'
        });
      }

      const nameToUse = userName || 'Voluntario (Sin nombre)';

      const result = await this.createPaymentUseCase.execute({
        amount: Number(amount),
        currency: currency || 'mxn',
        userId: user.userId.toString(),
        userEmail: user.email,
        userName: nameToUse,
        kitchenId: kitchenId.toString(),
        description: description,
        successUrl: 'https://google.com?status=success',
        cancelUrl: 'https://google.com?status=cancel'
      });

      res.status(201).json({ success: true, data: result });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Error al generar el link de pago',
        error: errorMessage,
      });
    }
  };
}