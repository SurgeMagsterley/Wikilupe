const User = require('../models/User');

function setFlash(req, type, message) {
  if (req.session) {
    req.session.flash = { type, message };
  }
}

/**
 * Carga el usuario de la sesión y expone helpers de vista.
 */
async function loadUser(req, res, next) {
  res.locals.user = null;
  res.locals.flash = null;
  res.locals.currentPath = req.path;

  try {
    if (req.session && req.session.userId) {
      // User.findById es asíncrona (PostgreSQL): hay que esperar el resultado.
      const user = await User.findById(req.session.userId);

      if (user) {
        req.user = user;
        res.locals.user = user;
      } else {
        delete req.session.userId;
      }
    }

    if (req.session && req.session.flash) {
      res.locals.flash = req.session.flash;
      delete req.session.flash;
    }
  } catch (error) {
    return next(error);
  }

  return next();
}

function requireAuth(req, res, next) {
  if (req.user) return next();

  if (req.method === 'GET') {
    req.session.returnTo = req.originalUrl;
  }

  setFlash(req, 'error', 'Tienes que iniciar sesión para entrar allí.');
  return res.redirect('/auth/login');
}

function requireAdmin(req, res, next) {
  if (req.user && req.user.is_admin) return next();

  if (!req.user) {
    setFlash(req, 'error', 'Inicia sesión con una cuenta de administración.');
    return res.redirect('/auth/login');
  }

  return res.status(403).render('errors/403', {
    title: 'Acceso denegado',
    currentPath: req.path
  });
}

function guestOnly(req, res, next) {
  if (req.user) return res.redirect('/perfil');
  return next();
}

module.exports = {
  setFlash,
  loadUser,
  requireAuth,
  requireAdmin,
  guestOnly
};