const db = require('../config/database');

const DETAIL_FIELDS = {
  titles: 'titles',
  feats: 'feats',
  combatStyle: 'combat_style',
  combatRole: 'combat_role',
  maritalStatus: 'marital_status',
  lifeStatus: 'life_status',
  birthday: 'birthday',
  age: 'age',
  powers: 'powers',
  universe: 'universe',
  affiliations: 'affiliations',
  religion: 'religion',
  species: 'species',
  bgColor: 'bg_color',
  bgImage: 'bg_image',
  history: 'history'
};

function detailValues(data) {
  return Object.keys(DETAIL_FIELDS).map((key) => data[key] || '');
}

function list({ q = '', role = '', element = '', creator = '' } = {}) {
  const conditions = [];
  const params = [];

  const search = String(q || '').trim();
  if (search) {
    conditions.push('(c.name LIKE ? OR c.description LIKE ? OR u.username LIKE ?)');
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  if (role) {
    conditions.push('c.role = ?');
    params.push(role);
  }

  if (element) {
    conditions.push('LOWER(c.element) = LOWER(?)');
    params.push(element);
  }

  const creatorFilter = String(creator || '').trim();
  if (creatorFilter) {
    conditions.push('u.username LIKE ?');
    params.push(`%${creatorFilter}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  return db.prepare(`
    SELECT c.*, u.username,
      (SELECT i.filename FROM character_images i
        WHERE i.character_id = c.id ORDER BY i.position ASC, i.id ASC LIMIT 1) AS cover
    FROM characters c
    JOIN users u ON u.id = c.user_id
    ${where}
    ORDER BY c.created_at DESC, c.id DESC
  `).all(...params);
}

function findById(id) {
  return db.prepare(`
    SELECT c.*, u.username, u.avatar AS owner_avatar
    FROM characters c
    JOIN users u ON u.id = c.user_id
    WHERE c.id = ?
  `).get(id);
}

function listByUser(userId) {
  return db.prepare(`
    SELECT c.*,
      (SELECT i.filename FROM character_images i
        WHERE i.character_id = c.id ORDER BY i.position ASC, i.id ASC LIMIT 1) AS cover,
      (SELECT COUNT(*) FROM character_images i WHERE i.character_id = c.id) AS image_count
    FROM characters c
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC, c.id DESC
  `).all(userId);
}

function featuredByUser(userId, limit = 3) {
  return db.prepare(`
    SELECT c.*,
      (SELECT i.filename FROM character_images i
        WHERE i.character_id = c.id ORDER BY i.position ASC, i.id ASC LIMIT 1) AS cover
    FROM characters c
    WHERE c.user_id = ?
    ORDER BY c.updated_at DESC, c.created_at DESC, c.id DESC
    LIMIT ?
  `).all(userId, limit);
}


function count() {
  return db.prepare('SELECT COUNT(*) AS total FROM characters').get().total;
}

function countByRole() {
  return db.prepare(`
    SELECT role, COUNT(*) AS total FROM characters GROUP BY role
  `).all();
}

function allForSelect(excludeId) {
  return db.prepare(`
    SELECT c.id, c.name, c.role, u.username
    FROM characters c
    JOIN users u ON u.id = c.user_id
    WHERE c.id != ?
    ORDER BY c.name COLLATE NOCASE
  `).all(excludeId || 0);
}

function create(userId, data) {
  const detailKeys = Object.keys(DETAIL_FIELDS);
  const columns = [
    'user_id', 'name', 'description', 'element', 'sexuality', 'gender', 'role',
    'stat_physical_attack', 'stat_special_attack', 'stat_physical_defense',
    'stat_special_defense', 'stat_speed',
    ...detailKeys.map((key) => DETAIL_FIELDS[key])
  ];

  const values = [
    userId,
    data.name,
    data.description,
    data.element,
    data.sexuality,
    data.gender,
    data.role,
    data.stats.physicalAttack,
    data.stats.specialAttack,
    data.stats.physicalDefense,
    data.stats.specialDefense,
    data.stats.speed,
    ...detailValues(data)
  ];

  const info = db.prepare(`
    INSERT INTO characters (${columns.join(', ')})
    VALUES (${columns.map(() => '?').join(', ')})
  `).run(...values);

  return info.lastInsertRowid;
}

function update(id, data) {
  const detailKeys = Object.keys(DETAIL_FIELDS);
  const assignments = [
    'name = ?',
    'description = ?',
    'element = ?',
    'sexuality = ?',
    'gender = ?',
    'role = ?',
    'stat_physical_attack = ?',
    'stat_special_attack = ?',
    'stat_physical_defense = ?',
    'stat_special_defense = ?',
    'stat_speed = ?',
    ...detailKeys.map((key) => `${DETAIL_FIELDS[key]} = ?`),
    "updated_at = datetime('now')"
  ];

  const values = [
    data.name,
    data.description,
    data.element,
    data.sexuality,
    data.gender,
    data.role,
    data.stats.physicalAttack,
    data.stats.specialAttack,
    data.stats.physicalDefense,
    data.stats.specialDefense,
    data.stats.speed,
    ...detailValues(data),
    id
  ];

  db.prepare(`UPDATE characters SET ${assignments.join(', ')} WHERE id = ?`).run(...values);
}

function remove(id) {
  db.prepare('DELETE FROM characters WHERE id = ?').run(id);
}

module.exports = {
  list,
  findById,
  listByUser,
  count,
  countByRole,
  allForSelect,
  create,
  update,
  remove,
  featuredByUser
};
