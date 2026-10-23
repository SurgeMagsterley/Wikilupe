require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const multer = require('multer');

const SQLiteStore = require('./config/sessionStore');
const seedSuperadmin = require('./config/seed');
const { loadUser, setFlash } = require('./middlewares/auth');
const {
  ROLES,
  ELEMENTS,
  RELATION_TYPES,
  GENDERS,
  SEXUALITIES,
  COMBAT_ROLES,
  MARITAL_STATUSES,
  LIFE_STATUSES,
  SPECIES,
  RELIGIONS,
  COLOR_PRESETS,
  ELEMENT_THEMES,
  roleInfo,
  relationInfo,
  elementInfo,
  elementTheme,
  initials,
  formatDate,
  formatDateTime
} = require('./config/constants');

seedSuperadmin();

const app = express();

app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false, limit: '2mb' }));

const sessionSecret = process.env.SESSION_SECRET || 'wikilupe-dev-secret-cambiar';
if (!process.env.SESSION_SECRET) {
  console.warn('[aviso] SESSION_SECRET no está definido. Usando un valor de desarrollo inseguro.');
}

app.use(session({
  store: new SQLiteStore(),
  name: 'wikilupe.sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SQLiteStore.FIFTEEN_DAYS
  }
}));

// Datos y helpers disponibles en todas las vistas.
app.use((req, res, next) => {
  res.locals.appName = 'WikiLupe';
  res.locals.ROLES = ROLES;
  res.locals.ELEMENTS = ELEMENTS;
  res.locals.RELATION_TYPES = RELATION_TYPES;
  res.locals.GENDERS = GENDERS;
  res.locals.SEXUALITIES = SEXUALITIES;
  res.locals.COMBAT_ROLES = COMBAT_ROLES;
  res.locals.MARITAL_STATUSES = MARITAL_STATUSES;
  res.locals.LIFE_STATUSES = LIFE_STATUSES;
  res.locals.SPECIES = SPECIES;
  res.locals.RELIGIONS = RELIGIONS;
  res.locals.COLOR_PRESETS = COLOR_PRESETS;
  res.locals.ELEMENT_THEMES = ELEMENT_THEMES;
  res.locals.roleInfo = roleInfo;
  res.locals.relationInfo = relationInfo;
  res.locals.elementInfo = elementInfo;
  res.locals.elementTheme = elementTheme;
  res.locals.initials = initials;
  res.locals.formatDate = formatDate;
  res.locals.formatDateTime = formatDateTime;
  next();
});

app.use(loadUser);

app.use('/', require('./routes/home'));
app.use('/auth', require('./routes/auth'));
app.use('/perfil', require('./routes/profile'));
app.use('/usuarios', require('./routes/users'));
app.use('/personajes', require('./routes/characters'));
app.use('/admin', require('./routes/admin'));

app.use((req, res) => {
  return res.status(404).render('errors/404', {
    title: 'Página no encontrada',
    currentPath: req.path
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  const isUploadError = error instanceof multer.MulterError || error.status === 400 || error.status === 413;

  if (isUploadError) {
    let message = error.message || 'No se pudo subir la imagen.';

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        message = 'La imagen es demasiado grande. El máximo es 6 MB por foto (4 MB para el avatar).';
      } else if (error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE') {
        message = 'Se subieron demasiadas imágenes o el campo no es válido.';
      }
    }

    if (req.session) {
      setFlash(req, 'error', message);
    }

    const referer = req.get('Referer') || '';
    const origin = `${req.protocol}://${req.get('host')}`;
    return res.redirect(referer.startsWith(origin) ? referer : '/personajes');
  }

  return res.status(500).render('errors/500', {
    title: 'Error del servidor',
    currentPath: req.path
  });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`WikiLupe está corriendo en http://localhost:${PORT}`);
});

module.exports = app;
