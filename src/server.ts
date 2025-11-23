import dotenv from 'dotenv';
dotenv.config(); 

import app from './app';

const PORT = process.env.PORT || 3005; 

async function startServer() {
  try {
    console.log('🚀 Iniciando Servidor de Pagos...');


    app.listen(PORT, () => {
      console.log(`🌐 Servidor corriendo en el puerto ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();