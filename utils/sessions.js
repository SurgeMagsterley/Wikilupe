const db = require('../config/database');

/**
 * Elimina las sesiones guardadas de un usuario. Si se pasa exceptSid,
 * conserva esa sesión (por ejemplo, la del usuario que cambia su propia clave).
 */
function destroyUserSessions(userId, exceptSid = null) {
  const rows = db.prepare('SELECT sid, sess FROM sessions').all();
  const remove = db.prepare('DELETE FROM sessions WHERE sid = ?');

  rows.forEach((row) => {
    if (exceptSid && row.sid === exceptSid) return;

    try {
      const sessionData = JSON.parse(row.sess);
      if (sessionData.userId === userId) {
        remove.run(row.sid);
      }
    } catch (error) {
      // Si la sesión está corrupta, se elimina igual.
      remove.run(row.sid);
    }
  });
}

module.exports = { destroyUserSessions };
