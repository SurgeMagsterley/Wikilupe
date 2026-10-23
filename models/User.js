const db = require('../config/database');

function findByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(String(username).trim());
}

function findById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function create(username, passwordHash) {
  const info = db.prepare(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)'
  ).run(String(username).trim(), passwordHash);
  return findById(info.lastInsertRowid);
}

function updateAvatar(id, filename) {
  db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(filename, id);
}

function updatePassword(id, passwordHash) {
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, id);
}

function listAll() {
  return db.prepare(`
    SELECT u.id, u.username, u.avatar, u.is_admin, u.created_at,
           COUNT(c.id) AS character_count
    FROM users u
    LEFT JOIN characters c ON c.user_id = u.id
    GROUP BY u.id
    ORDER BY u.is_admin DESC, u.username COLLATE NOCASE
  `).all();
}

function listUsernames() {
  return db.prepare('SELECT username FROM users ORDER BY username COLLATE NOCASE')
    .all()
    .map((row) => row.username);
}

function count() {
  return db.prepare('SELECT COUNT(*) AS total FROM users').get().total;
}

function remove(id) {
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
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
