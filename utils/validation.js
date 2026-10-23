function clean(value, maxLength = 500) {
  return String(value === undefined || value === null ? '' : value)
    .trim()
    .slice(0, maxLength);
}

function isValidUsername(username) {
  return /^[A-Za-z0-9_.-]{3,24}$/.test(username);
}

function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 6 && password.length <= 72;
}

/**
 * Convierte una estadística vacía en null y valida que sea un entero.
 * No se aplica ningún límite máximo a propósito.
 */
function parseStat(value) {
  const raw = String(value === undefined || value === null ? '' : value).trim();
  if (raw === '') return null;

  const number = Number(raw);
  if (!Number.isFinite(number) || !Number.isInteger(number)) {
    return { error: true };
  }

  return number;
}

function parseStats(body) {
  const fields = {
    physicalAttack: body.stat_physical_attack,
    specialAttack: body.stat_special_attack,
    physicalDefense: body.stat_physical_defense,
    specialDefense: body.stat_special_defense,
    speed: body.stat_speed
  };

  const stats = {};
  for (const [key, raw] of Object.entries(fields)) {
    const value = parseStat(raw);
    if (value && value.error) {
      return { error: 'Las estadísticas tienen que ser números enteros (o quedar vacías).' };
    }
    stats[key] = value;
  }

  return { stats };
}

function parseFacts(raw) {
  return String(raw || '')
    .split(/\r?\n/)
    .map((line) => line.trim().slice(0, 500))
    .filter(Boolean)
    .slice(0, 60);
}

module.exports = {
  clean,
  isValidUsername,
  isValidPassword,
  parseStat,
  parseStats,
  parseFacts
};
