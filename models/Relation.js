const db = require('../config/database');

function listByCharacter(characterId) {
  return db.prepare(`
    SELECT r.*,
      c.name AS related_name,
      c.role AS related_role,
      u.username AS related_username,
      (SELECT i.filename FROM character_images i
        WHERE i.character_id = c.id ORDER BY i.position ASC, i.id ASC LIMIT 1) AS related_cover
    FROM relations r
    LEFT JOIN characters c ON c.id = r.related_character_id
    LEFT JOIN users u ON u.id = c.user_id
    WHERE r.character_id = ?
    ORDER BY
      CASE r.relation_type WHEN 'familiar' THEN 1 WHEN 'amigo' THEN 2 ELSE 3 END,
      COALESCE(c.name, r.external_name) COLLATE NOCASE
  `).all(characterId);
}

function add(characterId, relationType, relatedCharacterId, externalName) {
  return db.prepare(`
    INSERT INTO relations (character_id, related_character_id, external_name, relation_type)
    VALUES (?, ?, ?, ?)
  `).run(characterId, relatedCharacterId || null, externalName || null, relationType);
}

function findById(id) {
  return db.prepare('SELECT * FROM relations WHERE id = ?').get(id);
}

function remove(id, characterId) {
  return db.prepare('DELETE FROM relations WHERE id = ? AND character_id = ?').run(id, characterId);
}

function count() {
  return db.prepare('SELECT COUNT(*) AS total FROM relations').get().total;
}

module.exports = {
  listByCharacter,
  add,
  findById,
  remove,
  count
};
