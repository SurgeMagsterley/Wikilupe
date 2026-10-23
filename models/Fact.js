const db = require('../config/database');

function listByCharacter(characterId) {
  return db.prepare(`
    SELECT * FROM character_facts
    WHERE character_id = ?
    ORDER BY position ASC, id ASC
  `).all(characterId);
}

function replaceAll(characterId, facts) {
  const removeAll = db.prepare('DELETE FROM character_facts WHERE character_id = ?');
  const insert = db.prepare(
    'INSERT INTO character_facts (character_id, content, position) VALUES (?, ?, ?)'
  );

  const transaction = db.transaction((items) => {
    removeAll.run(characterId);
    items.forEach((fact, index) => insert.run(characterId, fact, index));
  });

  transaction(facts);
}

module.exports = {
  listByCharacter,
  replaceAll
};
