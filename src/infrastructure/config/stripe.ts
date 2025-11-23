import Stripe from 'stripe';
import dotenv from 'dotenv';


dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('❌ Error: STRIPE_SECRET_KEY no está definida en .env');
  throw new Error('STRIPE_SECRET_KEY no está configurada');
}

export const stripe = new Stripe(stripeSecretKey, {

  apiVersion: '2025-10-29.clover',
  typescript: true,
});

console.log('✅ Cliente de Stripe inicializado (en modo simulación).');