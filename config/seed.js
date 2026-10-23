require('dotenv').config();

const bcrypt = require('bcryptjs');
const db = require('./database');

/**
 * Crea el usuario superadmin exclusivo del proyecto.
 * Si ya existe, no se modifica su contraseña (para no pisar cambios hechos
 * desde el panel de administración).
 */
function seedSuperadmin() {
  const username = (process.env.SUPERADMIN_USER || 'superadmin').trim();
  const password = process.env.SUPERADMIN_PASSWORD || 'AdminFachero#2026';

  const existing = db.prepare('SELECT id, is_admin FROM users WHERE username = ?').get(username);
  if (existing) {
    if (!existing.is_admin) {
      db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(existing.id);
      console.log(`[seed] El usuario "${username}" ya existía y ahora tiene permisos de superadmin.`);
    }
    return existing.id;
  }

  const hash = bcrypt.hashSync(password, 12);
  const info = db.prepare(
    'INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, 1)'
  ).run(username, hash);

  console.log(`[seed] Superadmin creado: usuario "${username}"`);
  return info.lastInsertRowid;
}

if (require.main === module) {
  seedSuperadmin();
  console.log('[seed] Listo.');
}

module.exports = seedSuperadmin;
