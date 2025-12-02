import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { PaymentEntity } from '../entities/Payment.entity';

dotenv.config();

// Validamos que existan las variables para evitar errores raros
if (!process.env.DB_HOST || !process.env.DB_PORT || !process.env.DB_USERNAME || !process.env.DB_PASSWORD || !process.env.DB_DATABASE) {
  throw new Error('❌ Faltan variables de entorno de base de datos en el archivo .env');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  // Usamos 'as string' para asegurar a TypeScript que el valor existe
  host: process.env.DB_HOST as string,
  port: parseInt(process.env.DB_PORT as string), 
  username: process.env.DB_USERNAME as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_DATABASE as string,
  
  // Sincronización automática (Crea las tablas)
  synchronize: process.env.DB_SYNCHRONIZE === 'true', 
  logging: process.env.DB_LOGGING === 'true',
  
  entities: [PaymentEntity],
  migrations: [],
  subscribers: [],
});