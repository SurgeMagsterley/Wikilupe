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

/**
 * Ejecuta varias consultas dentro de una transacción.
 * Si algo falla se hace ROLLBACK y no queda nada guardado a medias.
 */
async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('[db] Error al hacer ROLLBACK:', rollbackError.message);
    }
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  transaction,
  pool
};