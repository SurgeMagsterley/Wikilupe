const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.warn('[aviso] DATABASE_URL no está definido. Usando conexión vacía (solo para desarrollo sin BD).');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
