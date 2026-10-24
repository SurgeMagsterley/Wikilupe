const db = require('../config/database');

async function listByCharacter(characterId) {
  const result = await db.query(`
    SELECT * FROM character_images
    WHERE character_id = $1
    ORDER BY position ASC, id ASC
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

async function add(characterId, filename, nickname, position = 0) {
  const result = await db.query(`
    INSERT INTO character_images (character_id, filename, nickname, position)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `, [characterId, filename, nickname || '', position]);
  return result.rows[0];
}

async function updateNickname(id, nickname) {
  await db.query('UPDATE character_images SET nickname = $1 WHERE id = $2', [nickname || '', id]);
}

async function remove(id) {
  await db.query('DELETE FROM character_images WHERE id = $1', [id]);
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
  updateNickname,
  remove,
  listFilenames,
  count
};
