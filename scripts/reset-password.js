require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function resetPassword() {
  const args = process.argv.slice(2);
  const username = args[0];
  const newPassword = args[1];

  if (!username || !newPassword) {
    console.error('Uso: node scripts/reset-password.js <usuario> <nueva-contraseña>');
    process.exit(1);
  }

  try {
    const existing = await db.query('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [username]);
    if (existing.rows.length === 0) {
      console.error('Usuario no encontrado.');
      process.exit(1);
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await db.query('UPDATE users SET password_hash = $1 WHERE LOWER(username) = LOWER($2)', [hash, username]);
    await db.query('DELETE FROM session WHERE sess::jsonb->>\'userId\' = $1', [String(existing.rows[0].id)]);
    console.log(`Contraseña actualizada para ${username}. Sesiones cerradas.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
