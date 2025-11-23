import { Router } from 'express';
import controller from '../controllers/PaymentController';
import { requireAuth } from '../../../middleware/require-auth';
import { requireRole } from '../../../middleware/require-role';

const router = Router();

const ROLE_ADMIN_COCINA = 'admin de cocina';


router.get(
  '/balance',
  requireRole(ROLE_ADMIN_COCINA), 
  controller.getBalance
);

router.get(
  '/history',
  requireRole(ROLE_ADMIN_COCINA), 
  controller.getTransactionHistory
);

router.post(
  '/create-intent',
  requireAuth,
  controller.createPayment
);

export default router;