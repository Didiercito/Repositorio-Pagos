import 'reflect-metadata'; // Necesario para TypeORM
import dotenv from 'dotenv';
dotenv.config(); 

import app from './app';
import { KitchenRegisteredConsumer } from './infrastructure/events/KitchenRegisteredConsumer'; 
import { KitchenRegisteredConsumer } from './infrastructure/events/KitchenRegisteredConsumer';
import { AppDataSource } from './infrastructure/database/config/data-source';

const PORT = process.env.PORT || 3005;

async function startServer() {
  try {
    console.log('🚀 Iniciando Servidor de Pagos...');

    // 1. Conectar Base de Datos
    try {
      await AppDataSource.initialize();
      console.log('✅ Base de Datos conectada y sincronizada.');
    } catch (dbError) {
      console.error('❌ Error conectando a la Base de Datos:', dbError);
      process.exit(1); // Si falla la BD, detenemos todo
    }
    
    const consumer = new KitchenRegisteredConsumer(); 
    await consumer.start();                           

    const consumer = new KitchenRegisteredConsumer();
    await consumer.start();
    
    app.listen(PORT, () => {
      console.log(`🌐 Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();