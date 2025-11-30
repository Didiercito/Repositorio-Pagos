import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const secret = process.env.JWT_SECRET;
if (!secret) throw new Error('No JWT_SECRET');

// DATOS DEL ADMIN DE COCINA
const payload = {
  userId: 66,                
  email: 'admin@cocina.com',
  roles: ['admin de cocina'], // Rol necesario para entrar
  kitchenId: '2'           // <--- ESTA ES LA CLAVE. Si cambias esto a '2', verás otros datos.
};

const token = jwt.sign(payload, secret);

console.log('\n👨‍🍳 --- TOKEN ADMIN COCINA 1 --- 👨‍🍳\n');
console.log(token);
console.log('\n-----------------------------------\n');