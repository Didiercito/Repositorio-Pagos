import { Request, Response } from 'express';
import {
  getBalanceUseCase,
  getTransactionHistoryUseCase,
  createPaymentUseCase, 
} from '../dependencies/dependencies';

class PaymentController {
  async getBalance(req: Request, res: Response) {
    try {
      const balance = await getBalanceUseCase.execute();
      res.status(200).json({ success: true, data: balance });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Error al obtener el balance',
        error: errorMessage,
      });
    }
  }

  async getTransactionHistory(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const starting_after = req.query.starting_after as string | undefined;
      const options: any = { limit };
      if (starting_after) {
        options.starting_after = starting_after;
      }

      const transactions = await getTransactionHistoryUseCase.execute(options);
      res.status(200).json({ success: true, data: transactions });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Error al obtener el historial de transacciones',
        error: errorMessage,
      });
    }
  }

  async createPayment(req: Request, res: Response) {
    try {
      const { amount, currency, description, userName } = req.body;

      const user = req.user;

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'No se pudo identificar al usuario. Revisa tu token.' 
        });
      }
      const nameToUse = userName || 'Voluntario (Sin nombre)';

      const result = await createPaymentUseCase.execute({
        amount: Number(amount),     
        currency: currency || 'mxn',
        userId: user.userId.toString(), 
        userEmail: user.email,         
        userName: nameToUse, 
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
  }
}

export default new PaymentController();