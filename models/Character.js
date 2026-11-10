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

async function list({ q = '', role = '', element = '', creator = '' } = {}) {
  const conditions = [];
  const params = [];
  let idx = 1;

  const search = String(q || '').trim();
  if (search) {
    conditions.push(`(c.name ILIKE $${idx} OR c.description ILIKE $${idx + 1} OR u.username ILIKE $${idx + 2})`);
    const like = `%${search}%`;
    params.push(like, like, like);
    idx += 3;
  }

  if (role) {
    conditions.push(`c.role = $${idx}`);
    params.push(role);
    idx += 1;
  }

  if (element) {
    conditions.push(`LOWER(c.element) = LOWER($${idx})`);
    params.push(element);
    idx += 1;
  }

  const creatorFilter = String(creator || '').trim();
  if (creatorFilter) {
    conditions.push(`u.username ILIKE $${idx}`);
    params.push(`%${creatorFilter}%`);
    idx += 1;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await db.query(`
    SELECT c.*, u.username,
      (SELECT i.filename FROM character_images i
        WHERE i.character_id = c.id
        ORDER BY i.is_primary DESC, i.position ASC, i.id ASC LIMIT 1) AS cover
    FROM characters c
    JOIN users u ON u.id = c.user_id
    ${where}
    ORDER BY c.created_at DESC, c.id DESC
  `, params);

  return result.rows;
}

async function findById(id) {
  const result = await db.query(`
    SELECT c.*, u.username, u.avatar AS owner_avatar
    FROM characters c
    JOIN users u ON u.id = c.user_id
    WHERE c.id = $1
  `, [id]);
  return result.rows[0] || null;
}

async function listByUser(userId) {
  const result = await db.query(`
    SELECT c.*,
      (SELECT i.filename FROM character_images i
        WHERE i.character_id = c.id
        ORDER BY i.is_primary DESC, i.position ASC, i.id ASC LIMIT 1) AS cover,
      (SELECT COUNT(*) FROM character_images i WHERE i.character_id = c.id) AS image_count
    FROM characters c
    WHERE c.user_id = $1
    ORDER BY c.featured_rank ASC NULLS LAST, c.created_at DESC, c.id DESC
  `, [userId]);
  return result.rows;
}

/**
 * Devuelve los 3 destacados elegidos por el usuario. Si todavía no eligió
 * ninguno, mantiene el comportamiento anterior: los 3 más recientes.
 */
async function featuredByUser(userId, limit = 3) {
  const selected = await db.query(`
    SELECT c.*,
      (SELECT i.filename FROM character_images i
        WHERE i.character_id = c.id
        ORDER BY i.is_primary DESC, i.position ASC, i.id ASC LIMIT 1) AS cover
    FROM characters c
    WHERE c.user_id = $1 AND c.featured_rank IS NOT NULL
    ORDER BY c.featured_rank ASC
    LIMIT $2
  `, [userId, limit]);

  if (selected.rows.length > 0) {
    return selected.rows;
  }

  const result = await db.query(`
    SELECT c.*,
      (SELECT i.filename FROM character_images i
        WHERE i.character_id = c.id
        ORDER BY i.is_primary DESC, i.position ASC, i.id ASC LIMIT 1) AS cover
    FROM characters c
    WHERE c.user_id = $1
    ORDER BY c.updated_at DESC, c.created_at DESC, c.id DESC
    LIMIT $2
  `, [userId, limit]);
  return result.rows;
}

/**
 * Guarda los destacados del usuario. Recibe IDs en orden (1.º, 2.º, 3.º).
 * Si hay menos de 3, los espacios restantes quedan vacíos.
 */
async function setFeatured(userId, characterIds, client) {
  const executor = client || db;
  await executor.query(
    'UPDATE characters SET featured_rank = NULL WHERE user_id = $1',
    [userId]
  );

  for (let index = 0; index < characterIds.length; index += 1) {
    await executor.query(
      'UPDATE characters SET featured_rank = $1 WHERE id = $2 AND user_id = $3',
      [index + 1, characterIds[index], userId]
    );
  }
}

async function count() {
  const result = await db.query('SELECT COUNT(*) AS total FROM characters');
  return parseInt(result.rows[0].total, 10);
}

async function countByRole() {
  const result = await db.query(`
    SELECT role, COUNT(*) AS total FROM characters GROUP BY role
  `);
  return result.rows;
}

async function findExistingIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const result = await db.query(
    'SELECT id FROM characters WHERE id = ANY($1::int[])',
    [ids]
  );
  return result.rows.map((row) => row.id);
}

async function allForSelect(excludeId) {
  const result = await db.query(`
    SELECT c.id, c.name, c.role, u.username,
           (SELECT i.filename FROM character_images i
             WHERE i.character_id = c.id
             ORDER BY i.is_primary DESC, i.position ASC, i.id ASC LIMIT 1) AS cover
    FROM characters c
    JOIN users u ON u.id = c.user_id
    WHERE c.id != $1
    ORDER BY LOWER(c.name)
  `, [excludeId || 0]);
  return result.rows;
}

async function create(userId, data, client) {
  const executor = client || db;
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

  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  const result = await executor.query(`
    INSERT INTO characters (${columns.join(', ')})
    VALUES (${placeholders})
    RETURNING id
  `, values);

  return result.rows[0].id;
}

async function update(id, data, client) {
  const executor = client || db;
  const detailKeys = Object.keys(DETAIL_FIELDS);
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

  const assignments = [
    'name = $1',
    'description = $2',
    'element = $3',
    'sexuality = $4',
    'gender = $5',
    'role = $6',
    'stat_physical_attack = $7',
    'stat_special_attack = $8',
    'stat_physical_defense = $9',
    'stat_special_defense = $10',
    'stat_speed = $11',
    ...detailKeys.map((key, idx) => `${DETAIL_FIELDS[key]} = $${12 + idx}`)
  ];

  await executor.query(`UPDATE characters SET ${assignments.join(', ')}, updated_at = NOW() WHERE id = $${values.length}`, values);
}

async function remove(id) {
  await db.query('DELETE FROM characters WHERE id = $1', [id]);
}

module.exports = {
  list,
  findById,
  listByUser,
  count,
  countByRole,
  allForSelect,
  findExistingIds,
  create,
  update,
  remove,
  featuredByUser,
  setFeatured
};