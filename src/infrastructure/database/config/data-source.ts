import { DataSource, DataSourceOptions } from 'typeorm';
import dotenv from 'dotenv';
import { PaymentEntity } from '../entities/Payment.entity';

dotenv.config();

const connectionOptions: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST as string,
    port: parseInt(process.env.DB_PORT as string), 
    username: process.env.DB_USERNAME as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_DATABASE as string,
    synchronize: process.env.DB_SYNCHRONIZE === 'true', 
    logging: process.env.DB_LOGGING === 'true',
    
    entities: [PaymentEntity],
    migrations: [],
    subscribers: [],
    ssl: process.env.DB_SSL === 'true'
        ? {
            rejectUnauthorized: false, 
          }
        : false, 
};

if (!connectionOptions.host || !connectionOptions.port || !connectionOptions.username || !connectionOptions.password || !connectionOptions.database) {
    throw new Error('❌ Faltan variables de entorno de base de datos en el archivo .env');
}

export const AppDataSource = new DataSource(connectionOptions);