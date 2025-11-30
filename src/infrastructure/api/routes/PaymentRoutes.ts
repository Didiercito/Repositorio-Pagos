import { Router } from 'express';
import { paymentController } from '../dependencies/dependencies';
import { requireAuth } from '../../../middleware/require-auth';
import { requireRole } from '../../../middleware/require-role';

const router = Router();

const ROLE_ADMIN_COCINA = 'admin de cocina';
const ROLE_VOLUNTARIO = 'Voluntario'; 


router.get(
  '/balance',
  requireRole(ROLE_ADMIN_COCINA),
  paymentController.getBalance 
);

router.get(
  '/history',
  requireRole(ROLE_ADMIN_COCINA),
  paymentController.getTransactionHistory
);

router.post(
  '/create-intent',
  requireRole(ROLE_VOLUNTARIO),
  paymentController.createPayment
);

export default router;