require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./database');

async function seedSuperadmin() {
  try {
    const username = (process.env.SUPERADMIN_USER || 'superadmin').trim();
    const password = process.env.SUPERADMIN_PASSWORD || 'AdminFachero#2026';

    const existing = await db.query('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [username]);

    if (existing.rows.length > 0) {
      console.log('[seed] El usuario superadmin ya existe.');
      return;
    }

    const hash = await bcrypt.hash(password, 12);
    await db.query(
      'INSERT INTO users (username, password_hash, is_admin) VALUES ($1, $2, 1)',
      [username, hash]
    );

    console.log(`[seed] Superadmin creado: ${username}`);
  } catch (error) {
    console.error('[seed] Error al crear superadmin:', error.message);
  }
}

if (require.main === module) {
  seedSuperadmin().then(() => process.exit(0));
}

module.exports = seedSuperadmin;
