const Character = require('../models/Character');
const CharacterImage = require('../models/CharacterImage');
const Fact = require('../models/Fact');
const Relation = require('../models/Relation');
const User = require('../models/User');
const { setFlash } = require('../middlewares/auth');
const { cleanupUploads, removeFile, removeCharacterFiles } = require('../utils/files');
const { clean, parseStats, parseFacts } = require('../utils/validation');
const { uploadToSupabase } = require('../middlewares/upload');
const {
  ROLE_NAMES,
  RELATION_NAMES,
  RELATION_TYPES,
  elementTheme,
  normalizeHexColor
} = require('../config/constants');

function emptyValues() {
  return {
    name: '',
    description: '',
    element: '',
    sexuality: '',
    gender: '',
    role: 'secundario',
    titles: '',
    feats: '',
    combatStyle: '',
    combatRole: '',
    maritalStatus: '',
    lifeStatus: '',
    birthday: '',
    age: '',
    powers: '',
    universe: '',
    affiliations: '',
    religion: '',
    species: '',
    bgColor: '',
    bgImage: '',
    history: '',
    stats: {
      physicalAttack: null,
      specialAttack: null,
      physicalDefense: null,
      specialDefense: null,
      speed: null
    },
    facts: ''
  };
}

function collectValues(body) {
  const errors = [];

  const name = clean(body.name, 80);
  const description = clean(body.description, 5000);
  const element = clean(body.element, 40);
  const sexuality = clean(body.sexuality, 40);
  const gender = clean(body.gender, 40);
  const role = clean(body.role, 30);

  if (name.length < 2) {
    errors.push('El nombre del personaje debe tener al menos 2 caracteres.');
  }

  if (!element) {
    errors.push('Indica el elemento del personaje.');
  }

  if (!ROLE_NAMES.includes(role)) {
    errors.push('Elige una categoría válida para el personaje.');
  }

  const parsed = parseStats(body);
  if (parsed.error) {
    errors.push(parsed.error);
  }

  const autoColor = String(body.bg_auto || '') === '1';
  const rawColor = clean(body.bg_color, 7);
  const bgColor = autoColor ? '' : normalizeHexColor(rawColor);

  if (!autoColor && rawColor && !bgColor) {
    errors.push('El color de fondo debe ser un valor hexadecimal válido (por ejemplo #7c4dff).');
  }

  return {
    errors,
    facts: parseFacts(body.facts),
    values: {
      name,
      description,
      element,
      sexuality,
      gender,
      role: ROLE_NAMES.includes(role) ? role : 'secundario',
      titles: clean(body.titles, 400),
      feats: clean(body.feats, 3000),
      combatStyle: clean(body.combat_style, 120),
      combatRole: clean(body.combat_role, 60),
      maritalStatus: clean(body.marital_status, 60),
      lifeStatus: clean(body.life_status, 60),
      birthday: clean(body.birthday, 40),
      age: clean(body.age, 40),
      powers: clean(body.powers, 20000),
      universe: clean(body.universe, 120),
      affiliations: clean(body.affiliations, 400),
      religion: clean(body.religion, 60),
      species: clean(body.species, 60),
      bgColor,
      bgImage: '',
      history: clean(body.history, 20000),
      stats: parsed.stats || emptyValues().stats,
      facts: String(body.facts || '')
    }
  };
}

function valuesFromCharacter(character, images, facts) {
  return {
    name: character.name,
    description: character.description,
    element: character.element,
    sexuality: character.sexuality,
    gender: character.gender,
    role: character.role,
    titles: character.titles || '',
    feats: character.feats || '',
    combatStyle: character.combat_style || '',
    combatRole: character.combat_role || '',
    maritalStatus: character.marital_status || '',
    lifeStatus: character.life_status || '',
    birthday: character.birthday || '',
    age: character.age || '',
    powers: character.powers || '',
    universe: character.universe || '',
    affiliations: character.affiliations || '',
    religion: character.religion || '',
    species: character.species || '',
    bgColor: character.bg_color || '',
    bgImage: character.bg_image || '',
    history: character.history || '',
    stats: {
      physicalAttack: character.stat_physical_attack,
      specialAttack: character.stat_special_attack,
      physicalDefense: character.stat_physical_defense,
      specialDefense: character.stat_special_defense,
      speed: character.stat_speed
    },
    facts: facts.map((fact) => fact.content).join('\n'),
    images
  };
}

function canManage(user, character) {
  return Boolean(user && character && (user.is_admin || user.id === character.user_id));
}

function imageNicknames(body, field) {
  const raw = body[field];
  if (Array.isArray(raw)) return raw;
  return raw ? [raw] : [];
}

async function saveNewImages(characterId, files, nicknames, startPosition) {
  if (!files || files.length === 0) return;
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    try {
      const uploaded = await uploadToSupabase(file.buffer, file.mimetype, file.originalname, 'characters');
      file.supabasePath = uploaded.filename;
      await CharacterImage.add(
        characterId,
        uploaded.filename,
        clean(nicknames[index], 60),
        startPosition + index
      );
    } catch (error) {
      console.error('Error subiendo imagen a Supabase:', error.message);
    }
  }
}

function renderCharacterForm(res, options) {
  return res.status(options.status || 200).render('characters/form', {
    title: options.title,
    mode: options.mode,
    character: options.character || null,
    values: options.values,
    images: options.images || [],
    errors: options.errors || [],
    candidates: options.candidates || [],
    showQuickIndex: options.showQuickIndex === true
  });
}

async function index(req, res) {
  const creatorQuery = req.query.creador !== undefined ? req.query.creador : req.query.usuario;
  const filters = {
    q: clean(req.query.q, 60),
    role: ROLE_NAMES.includes(req.query.role) ? req.query.role : '',
    element: clean(req.query.element, 40),
    creator: clean(creatorQuery, 60)
  };

  const [characters, countsRows, creators, total] = await Promise.all([
    Character.list(filters),
    Character.countByRole(),
    User.listUsernames(),
    Character.count()
  ]);

  const counts = {};
  countsRows.forEach((row) => {
    counts[row.role] = row.total;
  });

  return res.render('characters/index', {
    title: 'Personajes',
    characters,
    filters,
    counts,
    creators,
    total
  });
}

async function show(req, res) {
  const character = await Character.findById(req.params.id);

  if (!character) {
    return res.status(404).render('errors/404', { title: 'Personaje no encontrado' });
  }

  const [images, facts, relations] = await Promise.all([
    CharacterImage.listByCharacter(character.id),
    Fact.listByCharacter(character.id),
    Relation.listByCharacter(character.id)
  ]);
  const editable = canManage(req.user, character);

  const stats = [
    { label: 'Ataque físico', icon: '⚔️', value: character.stat_physical_attack },
    { label: 'Ataque especial', icon: '🔮', value: character.stat_special_attack },
    { label: 'Defensa física', icon: '🛡️', value: character.stat_physical_defense },
    { label: 'Defensa especial', icon: '🧿', value: character.stat_special_defense },
    { label: 'Velocidad', icon: '💨', value: character.stat_speed }
  ];

  const relationGroups = RELATION_TYPES.map((type) => ({
    ...type,
    items: relations.filter((relation) => relation.relation_type === type.value)
  }));

  const theme = elementTheme(character.element);

  const titleList = String(character.titles || '')
    .split(/\r?\n/)
    .map((title) => title.trim())
    .filter(Boolean)
    .slice(0, 20);

  const infoItems = [
    { label: 'Especie', value: character.species, icon: '🧬' },
    { label: 'Edad', value: character.age, icon: '🎂' },
    { label: 'Cumpleaños', value: character.birthday, icon: '📅' },
    { label: 'Estado civil', value: character.marital_status, icon: '💍' },
    { label: 'Estado vital', value: character.life_status, icon: '🫀' },
    { label: 'Religión', value: character.religion, icon: '🕊️' },
    { label: 'Universo', value: character.universe, icon: '🌌' },
    { label: 'Afiliaciones', value: character.affiliations, icon: '🏛️' }
  ].filter((item) => item.value);

  const combatItems = [
    { label: 'Rol de combate', value: character.combat_role, icon: '⚔️' },
    { label: 'Estilo de combate', value: character.combat_style, icon: '🥋' }
  ].filter((item) => item.value);

  const candidates = editable ? await Character.allForSelect(character.id) : [];

  return res.render('characters/show', {
    title: character.name,
    character,
    images,
    facts,
    stats,
    hasStats: stats.some((stat) => stat.value !== null && stat.value !== undefined),
    relationGroups,
    relationCount: relations.length,
    editable,
    theme,
    heroColor: character.bg_color || theme.colors[0],
    heroImage: character.bg_image || '',
    titleList,
    infoItems,
    combatItems,
    candidates
  });
}

function showCreate(req, res) {
  return renderCharacterForm(res, {
    title: 'Subir personaje',
    mode: 'create',
    values: emptyValues()
  });
}

async function create(req, res, next) {
  const files = req.files || {};
  const photoFiles = files.photos || [];
  const bgFile = files.bg_file && files.bg_file[0];

  try {
    const { values, errors, facts } = collectValues(req.body);

    if (errors.length) {
      cleanupUploads(photoFiles);
      if (bgFile && bgFile.supabasePath) removeFile('characters', bgFile.supabasePath);
      return renderCharacterForm(res, {
        status: 400,
        title: 'Subir personaje',
        mode: 'create',
        values,
        errors
      });
    }

    if (bgFile) {
      try {
        const uploadedBg = await uploadToSupabase(bgFile.buffer, bgFile.mimetype, bgFile.originalname, 'characters');
        bgFile.supabasePath = uploadedBg.filename;
        values.bgImage = uploadedBg.filename;
      } catch (error) {
        console.error('Error subiendo fondo a Supabase:', error.message);
      }
    }

    const characterId = await Character.create(req.user.id, values);
    await saveNewImages(characterId, photoFiles, imageNicknames(req.body, 'photo_nicknames'), 0);
    await Fact.replaceAll(characterId, facts);

    setFlash(req, 'success', '¡Personaje creado! Ya puedes agregar sus relaciones desde la ficha.');
    return res.redirect(`/personajes/${characterId}`);
  } catch (error) {
    cleanupUploads(photoFiles);
    if (bgFile && bgFile.supabasePath) removeFile('characters', bgFile.supabasePath);
    return next(error);
  }
}

async function showEdit(req, res) {
  const character = await Character.findById(req.params.id);

  if (!character) {
    return res.status(404).render('errors/404', { title: 'Personaje no encontrado' });
  }

  if (!canManage(req.user, character)) {
    return res.status(403).render('errors/403', { title: 'Acceso denegado' });
  }

  const [images, facts] = await Promise.all([
    CharacterImage.listByCharacter(character.id),
    Fact.listByCharacter(character.id)
  ]);

  return renderCharacterForm(res, {
    title: `Editar ${character.name}`,
    mode: 'edit',
    character,
    values: valuesFromCharacter(character, images, facts),
    images,
    showQuickIndex: true
  });
}

async function update(req, res, next) {
  const files = req.files || {};
  const photoFiles = files.photos || [];
  const bgFile = files.bg_file && files.bg_file[0];

  try {
    const character = await Character.findById(req.params.id);

    if (!character) {
      cleanupUploads(photoFiles);
      if (bgFile && bgFile.supabasePath) removeFile('characters', bgFile.supabasePath);
      return res.status(404).render('errors/404', { title: 'Personaje no encontrado' });
    }

    if (!canManage(req.user, character)) {
      cleanupUploads(photoFiles);
      if (bgFile && bgFile.supabasePath) removeFile('characters', bgFile.supabasePath);
      return res.status(403).render('errors/403', { title: 'Acceso denegado' });
    }

    const { values, errors, facts } = collectValues(req.body);
    const images = await CharacterImage.listByCharacter(character.id);

    if (errors.length) {
      cleanupUploads(photoFiles);
      if (bgFile && bgFile.supabasePath) removeFile('characters', bgFile.supabasePath);
      return renderCharacterForm(res, {
        status: 400,
        title: `Editar ${character.name}`,
        mode: 'edit',
        character,
        values,
        images,
        errors,
        showQuickIndex: true
      });
    }

    if (bgFile) {
      if (character.bg_image) removeFile('characters', character.bg_image);
      try {
        const uploadedBg = await uploadToSupabase(bgFile.buffer, bgFile.mimetype, bgFile.originalname, 'characters');
        bgFile.supabasePath = uploadedBg.filename;
        values.bgImage = uploadedBg.filename;
      } catch (error) {
        console.error('Error subiendo fondo a Supabase:', error.message);
        values.bgImage = character.bg_image || '';
      }
    } else if (String(req.body.remove_bg_image || '') === '1') {
      if (character.bg_image) removeFile('characters', character.bg_image);
      values.bgImage = '';
    } else {
      values.bgImage = character.bg_image || '';
    }

    await Character.update(character.id, values);

    for (let i = 0; i < images.length; i += 1) {
      const image = images[i];
      if (String(req.body[`remove_image_${image.id}`]) === '1') {
        await CharacterImage.remove(image.id);
        removeFile('characters', image.filename);
        continue;
      }

      const nicknameField = req.body[`nickname_${image.id}`];
      if (nicknameField !== undefined) {
        await CharacterImage.updateNickname(image.id, clean(nicknameField, 60));
      }
    }

    const remainingImages = await CharacterImage.listByCharacter(character.id);
    await saveNewImages(character.id, photoFiles, imageNicknames(req.body, 'new_nicknames'), remainingImages.length);
    await Fact.replaceAll(character.id, facts);

    setFlash(req, 'success', 'Cambios guardados correctamente.');
    return res.redirect(`/personajes/${character.id}`);
  } catch (error) {
    cleanupUploads(photoFiles);
    if (bgFile && bgFile.supabasePath) removeFile('characters', bgFile.supabasePath);
    return next(error);
  }
}

async function destroy(req, res) {
  const character = await Character.findById(req.params.id);

  if (!character) {
    return res.status(404).render('errors/404', { title: 'Personaje no encontrado' });
  }

  if (!canManage(req.user, character)) {
    return res.status(403).render('errors/403', { title: 'Acceso denegado' });
  }

  const filenames = await CharacterImage.listFilenames(character.id);
  await Character.remove(character.id);
  removeCharacterFiles(filenames);
  if (character.bg_image) removeFile('characters', character.bg_image);

  const requestedRedirect = req.body.redirect;
  const redirectTo = requestedRedirect === 'admin' && req.user.is_admin
    ? '/admin'
    : requestedRedirect === 'perfil'
      ? '/perfil'
      : '/personajes';

  setFlash(req, 'success', `El personaje "${character.name}" fue eliminado.`);
  return res.redirect(redirectTo);
}

async function addRelation(req, res) {
  const character = await Character.findById(req.params.id);

  if (!character) {
    return res.status(404).render('errors/404', { title: 'Personaje no encontrado' });
  }

  if (!canManage(req.user, character)) {
    return res.status(403).render('errors/403', { title: 'Acceso denegado' });
  }

  const relationType = clean(req.body.relation_type, 20);
  const externalName = clean(req.body.external_name, 80);
  const relatedId = Number(req.body.related_character_id);

  if (!RELATION_NAMES.includes(relationType)) {
    setFlash(req, 'error', 'Elige un tipo de relación válido (familiar, amigo o conocido).');
    return res.redirect(`/personajes/${character.id}#relaciones`);
  }

  let relatedCharacter = null;

  if (Number.isInteger(relatedId) && relatedId > 0) {
    if (relatedId === character.id) {
      setFlash(req, 'error', 'Un personaje no puede relacionarse consigo mismo.');
      return res.redirect(`/personajes/${character.id}#relaciones`);
    }

    relatedCharacter = await Character.findById(relatedId);
    if (!relatedCharacter) {
      setFlash(req, 'error', 'Ese personaje ya no existe. Recarga la página e intenta de nuevo.');
      return res.redirect(`/personajes/${character.id}#relaciones`);
    }
  }

  if (!relatedCharacter && !externalName) {
    setFlash(req, 'error', 'Elige un personaje del sitio o escribe el nombre de un personaje externo.');
    return res.redirect(`/personajes/${character.id}#relaciones`);
  }

  const existing = await Relation.listByCharacter(character.id);
  const duplicated = existing.some((relation) => {
    if (relation.relation_type !== relationType) return false;
    if (relatedCharacter) return relation.related_character_id === relatedCharacter.id;
    return !relation.related_character_id
      && String(relation.external_name || '').toLowerCase() === externalName.toLowerCase();
  });

  if (duplicated) {
    setFlash(req, 'info', 'Esa relación ya estaba registrada.');
    return res.redirect(`/personajes/${character.id}#relaciones`);
  }

  await Relation.add(character.id, relationType, relatedCharacter ? relatedCharacter.id : null, externalName || null);
  setFlash(req, 'success', 'Relación agregada al árbol.');
  return res.redirect(`/personajes/${character.id}#relaciones`);
}

async function removeRelation(req, res) {
  const character = await Character.findById(req.params.id);

  if (!character) {
    return res.status(404).render('errors/404', { title: 'Personaje no encontrado' });
  }

  if (!canManage(req.user, character)) {
    return res.status(403).render('errors/403', { title: 'Acceso denegado' });
  }

  const relation = await Relation.findById(req.params.relationId);
  if (!relation || relation.character_id !== character.id) {
    setFlash(req, 'error', 'Esa relación no existe.');
    return res.redirect(`/personajes/${character.id}#relaciones`);
  }

  await Relation.remove(relation.id, character.id);
  setFlash(req, 'success', 'Relación eliminada.');
  return res.redirect(`/personajes/${character.id}#relaciones`);
}

module.exports = {
  index,
  show,
  showCreate,
  create,
  showEdit,
  update,
  destroy,
  addRelation,
  removeRelation,
  canManage
};
