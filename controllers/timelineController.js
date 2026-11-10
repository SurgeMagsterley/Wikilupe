const db = require('../config/database');
const Character = require('../models/Character');
const TimelineEvent = require('../models/TimelineEvent');
const { setFlash } = require('../middlewares/auth');
const { clean } = require('../utils/validation');
const {
  TIMELINE_CATEGORIES,
  TIMELINE_NAMES,
  TIMELINE_MAX_LENGTH
} = require('../config/constants');

function normalizeCharacterIds(raw) {
  const values = Array.isArray(raw) ? raw : (raw ? [raw] : []);
  const ids = values
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);

  return [...new Set(ids)];
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

async function index(req, res) {
  const category = TIMELINE_NAMES.includes(req.query.categoria) ? req.query.categoria : '';

  const [events, characters, counts, total] = await Promise.all([
    TimelineEvent.list({ category }),
    Character.allForSelect(0),
    TimelineEvent.countsByCategory(),
    TimelineEvent.count()
  ]);

  return res.render('timeline/index', {
    title: 'Cronología',
    events,
    characters,
    categories: TIMELINE_CATEGORIES,
    counts,
    total,
    filterCategory: category,
    maxLength: TIMELINE_MAX_LENGTH,
    today: todayISO()
  });
}

async function create(req, res, next) {
  try {
    const category = clean(req.body.category, 30);
    const content = clean(req.body.content, TIMELINE_MAX_LENGTH);
    const eventDate = clean(req.body.event_date, 10);
    const characterIds = normalizeCharacterIds(req.body.character_ids);

    const renderError = (message) => {
      setFlash(req, 'error', message);
      return res.redirect('/cronologia#agregar-momento');
    };

    if (!TIMELINE_NAMES.includes(category)) {
      return renderError('Elige una categoría válida para el momento.');
    }

    if (!content) {
      return renderError('Escribe el momento que quieres agregar a la cronología.');
    }

    if (!isValidDate(eventDate)) {
      return renderError('Elige una fecha válida para el momento.');
    }

    if (characterIds.length === 0) {
      return renderError('Debes vincular el momento con al menos un personaje existente.');
    }

    const existingIds = await Character.findExistingIds(characterIds);
    if (existingIds.length !== characterIds.length) {
      return renderError('Uno de los personajes elegidos ya no existe. Recarga la página e intenta de nuevo.');
    }

    let eventId = null;
    await db.transaction(async (client) => {
      eventId = await TimelineEvent.create(
        req.user.id,
        category,
        content,
        characterIds,
        eventDate,
        client
      );
    });

    setFlash(req, 'success', 'Momento agregado a la cronología.');
    return res.redirect(eventId ? `/cronologia#momento-${eventId}` : '/cronologia');
  } catch (error) {
    return next(error);
  }
}

async function destroy(req, res, next) {
  try {
    const event = await TimelineEvent.findById(req.params.id);

    if (!event) {
      setFlash(req, 'error', 'Ese momento ya no existe.');
      return res.redirect('/cronologia');
    }

    if (!req.user.is_admin && event.user_id !== req.user.id) {
      return res.status(403).render('errors/403', {
        title: 'Acceso denegado',
        currentPath: req.path
      });
    }

    await TimelineEvent.remove(event.id);
    setFlash(req, 'success', 'Momento eliminado de la cronología.');
    return res.redirect('/cronologia');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  index,
  create,
  destroy
};
