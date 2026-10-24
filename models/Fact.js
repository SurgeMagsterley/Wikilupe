const db = require('../config/database');

async function listByCharacter(characterId) {
  const result = await db.query(`
    SELECT * FROM character_facts
    WHERE character_id = $1
    ORDER BY position ASC, id ASC
  `, [characterId]);
  return result.rows;
}

async function replaceAll(characterId, facts, client) {
  const executor = client || db;
  await executor.query('DELETE FROM character_facts WHERE character_id = $1', [characterId]);
  for (let i = 0; i < facts.length; i += 1) {
    await executor.query(
      'INSERT INTO character_facts (character_id, content, position) VALUES ($1, $2, $3)',
      [characterId, facts[i], i]
    );
  }
}

module.exports = {
  listByCharacter,
  replaceAll
};