const db = require('../config/database');

const TIMELINE_SELECT = `
  SELECT e.id,
         e.user_id,
         e.category,
         e.content,
         e.created_at,
         to_char(e.event_date, 'YYYY-MM-DD') AS event_date,
         u.username,
         u.avatar AS author_avatar,
         COALESCE(
           json_agg(
             json_build_object(
               'id', c.id,
               'name', c.name,
               'role', c.role,
               'username', cu.username,
               'cover', (
                 SELECT i.filename FROM character_images i
                 WHERE i.character_id = c.id
                 ORDER BY i.is_primary DESC, i.position ASC, i.id ASC
                 LIMIT 1
               )
             )
             ORDER BY c.name
           ) FILTER (WHERE c.id IS NOT NULL),
           '[]'::json
         ) AS characters
  FROM timeline_events e
  JOIN users u ON u.id = e.user_id
  LEFT JOIN timeline_event_characters ec ON ec.event_id = e.id
  LEFT JOIN characters c ON c.id = ec.character_id
  LEFT JOIN users cu ON cu.id = c.user_id
`;

async function list({ category = '' } = {}) {
  const params = [];
  let where = '';

  if (category) {
    params.push(category);
    where = 'WHERE e.category = $1';
  }

  const result = await db.query(`
    ${TIMELINE_SELECT}
    ${where}
    GROUP BY e.id, u.id, u.username, u.avatar
    ORDER BY e.event_date ASC, e.created_at ASC, e.id ASC
  `, params);

  return result.rows;
}

async function findById(id) {
  const result = await db.query(`
    ${TIMELINE_SELECT}
    WHERE e.id = $1
    GROUP BY e.id, u.id, u.username, u.avatar
  `, [id]);
  return result.rows[0] || null;
}

async function create(userId, category, content, characterIds, eventDate, client) {
  const executor = client || db;
  const result = await executor.query(`
    INSERT INTO timeline_events (user_id, category, content, event_date)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `, [userId, category, content, eventDate]);

  const eventId = result.rows[0].id;

  for (const characterId of characterIds) {
    await executor.query(`
      INSERT INTO timeline_event_characters (event_id, character_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [eventId, characterId]);
  }

  return eventId;
}

async function remove(id) {
  await db.query('DELETE FROM timeline_events WHERE id = $1', [id]);
}

async function count() {
  const result = await db.query('SELECT COUNT(*) AS total FROM timeline_events');
  return parseInt(result.rows[0].total, 10);
}

async function countsByCategory() {
  const result = await db.query(`
    SELECT category, COUNT(*) AS total
    FROM timeline_events
    GROUP BY category
  `);

  const counts = {};
  result.rows.forEach((row) => {
    counts[row.category] = parseInt(row.total, 10);
  });
  return counts;
}

module.exports = {
  list,
  findById,
  create,
  remove,
  count,
  countsByCategory
};
