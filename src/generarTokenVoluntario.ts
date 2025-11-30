import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// 1. Cargamos las variables del archivo .env
dotenv.config();

const secret = process.env.JWT_SECRET;

if (!secret) {
  console.error('❌ Error: No se encontró JWT_SECRET en el archivo .env');
  process.exit(1);
}

// 2. Datos del Voluntario
const payload = {
  userId: 99,                 
  email: 'juan@voluntario.com',
  roles: ['Voluntario'],      // El rol clave
  stateId: 7,                 
  municipalityId: 31
};

// 3. Crear el token con la firma correcta
const token = jwt.sign(payload, secret);

console.log('\n🎫 --- TOKEN DE VOLUNTARIO (CORRECTO) --- 🎫\n');
console.log(token);
console.log('\n---------------------------------\n');