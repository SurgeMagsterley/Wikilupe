const db = require('../config/database');

function listByCharacter(characterId) {
  return db.prepare(`
    SELECT * FROM character_images
    WHERE character_id = ?
    ORDER BY position ASC, id ASC
  `).all(characterId);
}

function findById(id) {
  return db.prepare('SELECT * FROM character_images WHERE id = ?').get(id);
}

function findByIdForCharacter(id, characterId) {
  return db.prepare(
    'SELECT * FROM character_images WHERE id = ? AND character_id = ?'
  ).get(id, characterId);
}

function add(characterId, filename, nickname, position = 0) {
  return db.prepare(`
    INSERT INTO character_images (character_id, filename, nickname, position)
    VALUES (?, ?, ?, ?)
  `).run(characterId, filename, nickname || '', position);
}

function updateNickname(id, nickname) {
  db.prepare('UPDATE character_images SET nickname = ? WHERE id = ?').run(nickname || '', id);
}

function remove(id) {
  db.prepare('DELETE FROM character_images WHERE id = ?').run(id);
}

function listFilenames(characterId) {
  return db.prepare('SELECT filename FROM character_images WHERE character_id = ?')
    .all(characterId)
    .map((row) => row.filename);
}

function count() {
  return db.prepare('SELECT COUNT(*) AS total FROM character_images').get().total;
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
