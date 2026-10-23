require('dotenv').config();

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { isValidPassword } = require('../utils/validation');
const { destroyUserSessions } = require('../utils/sessions');

const [username, password] = process.argv.slice(2);

if (!username || !password) {
  console.error('Uso: npm run reset-password -- <usuario> <nueva-contraseña>');
  process.exit(1);
}

if (!isValidPassword(password)) {
  console.error('La contraseña debe tener entre 6 y 72 caracteres.');
  process.exit(1);
}

const user = User.findByUsername(username);

if (!user) {
  console.error(`No existe el usuario "${username}".`);
  process.exit(1);
}

User.updatePassword(user.id, bcrypt.hashSync(password, 12));
destroyUserSessions(user.id);

console.log(`Contraseña de "${user.username}" actualizada. Se cerraron sus sesiones activas.`);
