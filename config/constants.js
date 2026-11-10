const ROLES = [
  { value: 'protagonista', label: 'Protagonista' },
  { value: 'co-protagonista', label: 'Co-protagonista' },
  { value: 'principal', label: 'Principal' },
  { value: 'secundario', label: 'Secundario' },
  { value: 'antagonista', label: 'Antagonista' },
  { value: 'villano', label: 'Villano' },
  { value: 'criatura', label: 'Criatura' },
  { value: 'invocacion', label: 'Invocación' }
];

const ELEMENTS = [
  { name: 'Fuego', emoji: '🔥' },
  { name: 'Agua', emoji: '💧' },
  { name: 'Viento', emoji: '🌪️' },
  { name: 'Tierra', emoji: '🪨' },
  { name: 'Rayo', emoji: '⚡' },
  { name: 'Hielo', emoji: '❄️' },
  { name: 'Luz', emoji: '✨' },
  { name: 'Oscuridad', emoji: '🌑' },
  { name: 'Naturaleza', emoji: '🌿' },
  { name: 'Veneno', emoji: '☠️' },
  { name: 'Sonido', emoji: '🎵' },
  { name: 'Gravedad', emoji: '🌀' },
  { name: 'Espacio', emoji: '🌌' },
  { name: 'Tiempo', emoji: '⏳' },
  { name: 'Sangre', emoji: '🩸' },
  { name: 'Sombra', emoji: '👤' },
  { name: 'Metal', emoji: '⚙️' },
  { name: 'Psíquico', emoji: '🧠' },
  { name: 'Arcana', emoji: '🔮' },
  { name: 'Ninguno', emoji: '🚫' }
];

const RELATION_TYPES = [
  { value: 'familiar', label: 'Familiares', emoji: '👪' },
  { value: 'amigo', label: 'Amigos', emoji: '🤝' },
  { value: 'conocido', label: 'Conocidos', emoji: '👋' },
  { value: 'pareja', label: 'Pareja', emoji: '💞' },
  { value: 'casado', label: 'Casado/a', emoji: '💍' }
];

const TIMELINE_CATEGORIES = [
  { value: 'importante', label: 'Importante', color: '#ffc857' },
  { value: 'relevante', label: 'Relevante', color: '#4ee1ff' },
  { value: 'principal', label: 'Principal', color: '#a66bff' },
  { value: 'secundario', label: 'Secundario', color: '#4ee6a8' },
  { value: 'historia', label: 'Historia de Personaje', color: '#ff4fd8' }
];

const TIMELINE_MAX_LENGTH = 700;
const MAX_FEATURED_CHARACTERS = 3;

const GENDERS = ['Masculino', 'Femenino', 'No binario', 'Transgénero', 'Intersexual', 'Otro'];
const SEXUALITIES = ['Heterosexual', 'Homosexual', 'Bisexual', 'Pansexual', 'Asexual', 'Demisexual', 'Queer', 'Otro'];

const COMBAT_ROLES = [
  'Atacante',
  'Tanque',
  'Sanador',
  'Soporte',
  'Control',
  'Asesino',
  'Invocador',
  'Tirador',
  'Brujo',
  'Híbrido'
];

const MARITAL_STATUSES = [
  'Soltero/a',
  'En pareja',
  'Comprometido/a',
  'Casado/a',
  'Separado/a',
  'Divorciado/a',
  'Viudo/a',
  'No aplica'
];

const LIFE_STATUSES = [
  'Vivo/a',
  'Muerto/a',
  'Desaparecido/a',
  'Desconocido',
  'Sellado/a',
  'Revivido/a',
  'Inmortal',
  'No aplica'
];

const SPECIES = [
  'Humano',
  'Elfo',
  'Semidiós',
  'Demonio',
  'Ángel',
  'Criatura',
  'Androide',
  'Espíritu',
  'Vampiro',
  'Hombre lobo',
  'Híbrido',
  'Otro'
];

const RELIGIONS = [
  'Ninguna',
  'Cristianismo',
  'Catolicismo',
  'Judaísmo',
  'Islam',
  'Budismo',
  'Hinduismo',
  'Paganismo',
  'Culto propio',
  'Otra'
];

const COLOR_PRESETS = [
  '#7c4dff',
  '#ff4fd8',
  '#4ee1ff',
  '#ffc857',
  '#4ee6a8',
  '#ff5e6c',
  '#5f9dff',
  '#a66bff'
];

// Paleta pastel y símbolo usados por el splash art del fondo de cada ficha.
const ELEMENT_THEMES = {
  fuego: { emoji: '🔥', colors: ['#ffd6c9', '#ffb8a3', '#ffe8d6'] },
  agua: { emoji: '💧', colors: ['#cbeaff', '#a9d9ff', '#e2f6ff'] },
  viento: { emoji: '🍃', colors: ['#dcf8e6', '#c4f0d8', '#edfff6'] },
  tierra: { emoji: '🪨', colors: ['#e8dccb', '#d6c1a6', '#f4e9db'] },
  rayo: { emoji: '⚡', colors: ['#fff4c9', '#ffe98a', '#fffbe2'] },
  hielo: { emoji: '❄️', colors: ['#d9f4ff', '#bfeaff', '#effcff'] },
  luz: { emoji: '✨', colors: ['#fff6d1', '#ffeaa8', '#fffcec'] },
  oscuridad: { emoji: '🌑', colors: ['#ded7f2', '#c5bae8', '#f1edff'] },
  naturaleza: { emoji: '🌿', colors: ['#d9f7dc', '#bdeec4', '#effff0'] },
  veneno: { emoji: '☠️', colors: ['#e2f9cb', '#c9eda4', '#f2ffe4'] },
  sonido: { emoji: '🎵', colors: ['#ffe3f1', '#ffc9e5', '#fff1f9'] },
  gravedad: { emoji: '🌀', colors: ['#e4e0ff', '#ccc5ff', '#f4f1ff'] },
  espacio: { emoji: '🌌', colors: ['#dde0ff', '#c2c9ff', '#eff1ff'] },
  tiempo: { emoji: '⏳', colors: ['#ffebcf', '#ffd8a8', '#fff7ec'] },
  sangre: { emoji: '🩸', colors: ['#ffd5da', '#ffb8c1', '#ffe9ec'] },
  sombra: { emoji: '👤', colors: ['#e0dce9', '#c8c3d6', '#f2f1f7'] },
  metal: { emoji: '⚙️', colors: ['#e6ebf2', '#ced8e4', '#f5f8fc'] },
  psiquico: { emoji: '🧠', colors: ['#ffdcf4', '#ffc4ec', '#fff0fa'] },
  arcana: { emoji: '🔮', colors: ['#ebdbff', '#d5b9ff', '#f8f0ff'] },
  ninguno: { emoji: '✨', colors: ['#ece6ff', '#d9d0f7', '#f9f6ff'] }
};

const THEME_FALLBACK = ELEMENT_THEMES.ninguno;


const ROLE_MAP = Object.fromEntries(ROLES.map((role) => [role.value, role]));
const RELATION_MAP = Object.fromEntries(RELATION_TYPES.map((type) => [type.value, type]));
const TIMELINE_MAP = Object.fromEntries(TIMELINE_CATEGORIES.map((category) => [category.value, category]));

function roleInfo(value) {
  return ROLE_MAP[value] || { value: value || 'secundario', label: value || 'Secundario' };
}

function relationInfo(value) {
  return RELATION_MAP[value] || { value, label: value };
}

function timelineCategoryInfo(value) {
  return TIMELINE_MAP[value] || { value, label: value, color: THEME_FALLBACK.colors[0] };
}

function elementInfo(value) {
  const element = ELEMENTS.find((item) => item.name.toLowerCase() === String(value || '').trim().toLowerCase());
  return element || { name: value || 'Sin elemento', emoji: '✨' };
}

function elementTheme(value) {
  return ELEMENT_THEMES[String(value || '').trim().toLowerCase()] || THEME_FALLBACK;
}

function normalizeHexColor(value) {
  const raw = String(value || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw.toLowerCase() : '';
}

function initials(name) {
  return String(name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || '?';
}

function toDate(value) {
  if (value instanceof Date) return value;
  if (!value) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  // ISO 8601 (`2026-11-09T12:00:00Z`) se parsea directo. Los valores tipo
  // `2026-11-09 12:00:00` se normalizan antes de agregarles la zona UTC.
  // Fecha sin hora: se interpreta en la zona local para no saltar de día.
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  let normalized = raw;
  if (/T\d{2}:\d{2}/.test(raw)) {
    // Normaliza zonas tipo `+00` a `+00:00`.
    normalized = raw.replace(/([+-]\d{2})$/, '$1:00');
  } else {
    normalized = raw.replace(' ', 'T');
    if (!/[zZ]$|[+-]\d{2}(:?\d{2})?$/.test(normalized)) {
      normalized += 'Z';
    } else {
      normalized = normalized.replace(/([+-]\d{2})$/, '$1:00');
    }
  }
  return new Date(normalized);
}

function formatDate(value) {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return value ? String(value) : '';
  return date.toLocaleDateString('es-419', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(value) {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return value ? String(value) : '';
  return date.toLocaleString('es-419', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDateParts(value) {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) {
    return { day: '--', month: '', year: '', time: '' };
  }

  return {
    day: date.toLocaleDateString('es-419', { day: '2-digit' }),
    month: date.toLocaleDateString('es-419', { month: 'short' }).replace('.', ''),
    year: date.toLocaleDateString('es-419', { year: 'numeric' }),
    time: date.toLocaleTimeString('es-419', { hour: '2-digit', minute: '2-digit' })
  };
}

module.exports = {
  ROLES,
  ELEMENTS,
  RELATION_TYPES,
  TIMELINE_CATEGORIES,
  TIMELINE_MAX_LENGTH,
  MAX_FEATURED_CHARACTERS,
  GENDERS,
  SEXUALITIES,
  COMBAT_ROLES,
  MARITAL_STATUSES,
  LIFE_STATUSES,
  SPECIES,
  RELIGIONS,
  COLOR_PRESETS,
  ELEMENT_THEMES,
  ROLE_MAP,
  TIMELINE_MAP,
  ROLE_NAMES: ROLES.map((role) => role.value),
  RELATION_NAMES: RELATION_TYPES.map((type) => type.value),
  TIMELINE_NAMES: TIMELINE_CATEGORIES.map((category) => category.value),
  roleInfo,
  relationInfo,
  timelineCategoryInfo,
  elementInfo,
  elementTheme,
  normalizeHexColor,
  initials,
  formatDate,
  formatDateTime,
  formatDateParts
};
