const db = require('../config/database');

async function findByUsername(username) {
  const result = await db.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [String(username).trim()]);
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function create(username, passwordHash) {
  const result = await db.query(
    'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
    [String(username).trim(), passwordHash]
  );
  return findById(result.rows[0].id);
}

async function updateAvatar(id, filename) {
  await db.query('UPDATE users SET avatar = $1 WHERE id = $2', [filename, id]);
}

async function updatePassword(id, passwordHash) {
  await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, id]);
}

async function listAll() {
  const result = await db.query(`
    SELECT u.id, u.username, u.avatar, u.is_admin, u.created_at,
           COUNT(c.id) AS character_count
    FROM users u
    LEFT JOIN characters c ON c.user_id = u.id
    GROUP BY u.id
    ORDER BY u.is_admin DESC, LOWER(u.username)
  `);
  return result.rows;
}

async function listUsernames() {
  const result = await db.query('SELECT username FROM users ORDER BY LOWER(username)');
  return result.rows.map((row) => row.username);
}

async function count() {
  const result = await db.query('SELECT COUNT(*) AS total FROM users');
  return parseInt(result.rows[0].total, 10);
}

async function remove(id) {
  await db.query('DELETE FROM users WHERE id = $1', [id]);
}

module.exports = {
  findByUsername,
  findById,
  create,
  updateAvatar,
  updatePassword,
  listAll,
  listUsernames,
  count,
  remove
};
