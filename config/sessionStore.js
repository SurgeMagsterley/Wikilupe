const session = require('express-session');
const db = require('./database');

const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;

/**
 * Almacén de sesiones en SQLite.
 * Así las sesiones sobreviven a reinicios del servidor y la cookie
 * puede durar hasta 15 días, tal como se pidió.
 */
class SQLiteStore extends session.Store {
  constructor(options = {}) {
    super();
    this.ttl = options.ttl || FIFTEEN_DAYS;
    this.cleanupTimer = setInterval(() => this.cleanExpired(), 60 * 60 * 1000);
    this.cleanupTimer.unref();
    this.cleanExpired();
  }

  cleanExpired() {
    try {
      db.prepare('DELETE FROM sessions WHERE expires <= ?').run(Date.now());
    } catch (error) {
      console.error('No se pudieron limpiar las sesiones:', error.message);
    }
  }

  get(sid, callback) {
    try {
      const row = db.prepare('SELECT sess, expires FROM sessions WHERE sid = ?').get(sid);
      if (!row) return callback(null, null);

      if (row.expires <= Date.now()) {
        db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid);
        return callback(null, null);
      }

      return callback(null, JSON.parse(row.sess));
    } catch (error) {
      return callback(error);
    }
  }

  set(sid, sess, callback) {
    try {
      const expires = sess.cookie && sess.cookie.expires
        ? new Date(sess.cookie.expires).getTime()
        : Date.now() + this.ttl;

      db.prepare(`
        INSERT INTO sessions (sid, sess, expires) VALUES (?, ?, ?)
        ON CONFLICT(sid) DO UPDATE SET sess = excluded.sess, expires = excluded.expires
      `).run(sid, JSON.stringify(sess), expires);

      return callback && callback(null);
    } catch (error) {
      return callback && callback(error);
    }
  }

  touch(sid, sess, callback) {
    this.set(sid, sess, callback);
  }

  destroy(sid, callback) {
    try {
      db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid);
      return callback && callback(null);
    } catch (error) {
      return callback && callback(error);
    }
  }
}

module.exports = SQLiteStore;
module.exports.FIFTEEN_DAYS = FIFTEEN_DAYS;
