const db = require('../config/database');

async function listByCharacter(characterId) {
  const result = await db.query(`
    SELECT r.*,
           rc.name AS related_name,
           rc.role AS related_role,
           u.username AS related_username
    FROM relations r
    LEFT JOIN characters rc ON rc.id = r.related_character_id
    LEFT JOIN users u ON u.id = rc.user_id
    WHERE r.character_id = $1
    ORDER BY r.id ASC
  `, [characterId]);
  return result.rows;
}

async function findById(id) {
  const result = await db.query('SELECT * FROM relations WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function add(characterId, relationType, relatedCharacterId, externalName) {
  await db.query(`
    INSERT INTO relations (character_id, related_character_id, external_name, relation_type)
    VALUES ($1, $2, $3, $4)
  `, [characterId, relatedCharacterId || null, externalName || null, relationType]);
}

async function remove(id, characterId) {
  await db.query('DELETE FROM relations WHERE id = $1 AND character_id = $2', [id, characterId]);
}

async function count() {
  const result = await db.query('SELECT COUNT(*) AS total FROM relations');
  return parseInt(result.rows[0].total, 10);
}

module.exports = {
  listByCharacter,
  findById,
  add,
  remove,
  count
};
