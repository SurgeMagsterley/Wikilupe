const db = require('../config/database');

function destroyUserSessions(userId, currentSessionId) {
  if (!userId) return;
  const query = currentSessionId
    ? "DELETE FROM session WHERE sess::jsonb->>'userId' = $1 AND sid <> $2"
    : "DELETE FROM session WHERE sess::jsonb->>'userId' = $1";

  const params = currentSessionId ? [String(userId), currentSessionId] : [String(userId)];
  db.query(query, params).catch((error) => {
    console.error('No se pudieron cerrar las sesiones:', error.message);
  });
}

module.exports = {
  destroyUserSessions
};
