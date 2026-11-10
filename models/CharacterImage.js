const db = require('../config/database');

async function listByCharacter(characterId) {
  const result = await db.query(`
    SELECT * FROM character_images
    WHERE character_id = $1
    ORDER BY is_primary DESC, position ASC, id ASC
  `, [characterId]);
  return result.rows;
}

async function findById(id) {
  const result = await db.query('SELECT * FROM character_images WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function findByIdForCharacter(id, characterId) {
  const result = await db.query(
    'SELECT * FROM character_images WHERE id = $1 AND character_id = $2',
    [id, characterId]
  );
  return result.rows[0] || null;
}

async function add(characterId, filename, nickname, position = 0, client, isPrimary = false) {
  const executor = client || db;
  const result = await executor.query(`
    INSERT INTO character_images (character_id, filename, nickname, position, is_primary)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `, [characterId, filename, nickname || '', position, Boolean(isPrimary)]);
  return result.rows[0];
}

/**
 * Deja una sola imagen como principal. Se ejecuta dentro de una transacción
 * para que el índice único parcial nunca vea dos principales a la vez.
 */
async function setPrimary(characterId, imageId, client) {
  const executor = client || db;
  await executor.query(
    'UPDATE character_images SET is_primary = FALSE WHERE character_id = $1',
    [characterId]
  );
  await executor.query(
    'UPDATE character_images SET is_primary = TRUE WHERE id = $1 AND character_id = $2',
    [imageId, characterId]
  );
}

/**
 * Si el personaje tiene fotos pero ninguna principal, promueve la primera.
 */
async function ensurePrimary(characterId, client) {
  const executor = client || db;
  const primary = await executor.query(
    'SELECT id FROM character_images WHERE character_id = $1 AND is_primary LIMIT 1',
    [characterId]
  );
  if (primary.rows.length > 0) return primary.rows[0].id;

  const first = await executor.query(
    'SELECT id FROM character_images WHERE character_id = $1 ORDER BY position ASC, id ASC LIMIT 1',
    [characterId]
  );
  if (first.rows.length === 0) return null;

  await setPrimary(characterId, first.rows[0].id, executor);
  return first.rows[0].id;
}

async function updateNickname(id, nickname, client) {
  const executor = client || db;
  await executor.query('UPDATE character_images SET nickname = $1 WHERE id = $2', [nickname || '', id]);
}

async function remove(id, client) {
  const executor = client || db;
  await executor.query('DELETE FROM character_images WHERE id = $1', [id]);
}

async function listFilenames(characterId) {
  const result = await db.query('SELECT filename FROM character_images WHERE character_id = $1', [characterId]);
  return result.rows.map((row) => row.filename);
}

async function count() {
  const result = await db.query('SELECT COUNT(*) AS total FROM character_images');
  return parseInt(result.rows[0].total, 10);
}

module.exports = {
  listByCharacter,
  findById,
  findByIdForCharacter,
  add,
  setPrimary,
  ensurePrimary,
  updateNickname,
  remove,
  listFilenames,
  count
};