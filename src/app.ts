import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import paymentRoutes from './infrastructure/api/routes/PaymentRoutes';
import webhookController from './infrastructure/api/controllers/WebhookController';

const app: Express = express();

app.use(cors({ origin: '*' }));

app.post(
  '/api/v1/payments/webhook',
  express.json({ type: 'application/json' }),
  webhookController.handleWebhook
);

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/payments', paymentRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.send('API de Pagos (Stripe) funcionando');
});

export default app;