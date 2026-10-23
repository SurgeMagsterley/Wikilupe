const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { setFlash } = require('../middlewares/auth');
const { clean, isValidUsername, isValidPassword } = require('../utils/validation');

function beginSession(req, user, callback) {
  // Regeneramos la sesión al iniciar sesión para evitar fijación de sesión.
  req.session.regenerate((error) => {
    if (error) return callback(error);

    req.session.userId = user.id;
    req.session.save((saveError) => callback(saveError));
  });
}

function showLogin(req, res) {
  return res.render('auth/login', {
    title: 'Iniciar sesión',
    form: { username: '' },
    error: null
  });
}

async function login(req, res, next) {
  try {
    const username = clean(req.body.username, 24);
    const password = String(req.body.password || '');

    if (!username || !password) {
      return res.status(400).render('auth/login', {
        title: 'Iniciar sesión',
        form: { username },
        error: 'Completa tu usuario y tu contraseña.'
      });
    }

    const user = User.findByUsername(username);
    const matches = user ? await bcrypt.compare(password, user.password_hash) : false;

    if (!user || !matches) {
      return res.status(401).render('auth/login', {
        title: 'Iniciar sesión',
        form: { username },
        error: 'Usuario o contraseña incorrectos.'
      });
    }

    const returnTo = req.session.returnTo;

    return beginSession(req, user, (error) => {
      if (error) return next(error);

      if (returnTo) delete req.session.returnTo;

      setFlash(req, 'success', `¡Bienvenido de nuevo, ${user.username}!`);
      return res.redirect(returnTo || '/perfil');
    });
  } catch (error) {
    return next(error);
  }
}

function showRegister(req, res) {
  return res.render('auth/register', {
    title: 'Crear cuenta',
    form: { username: '' },
    error: null
  });
}

async function register(req, res, next) {
  try {
    const username = clean(req.body.username, 24);
    const password = String(req.body.password || '');
    const confirm = String(req.body.confirm_password || '');

    const renderError = (message, status = 400) => res.status(status).render('auth/register', {
      title: 'Crear cuenta',
      form: { username },
      error: message
    });

    if (!isValidUsername(username)) {
      return renderError('El usuario debe tener entre 3 y 24 caracteres y solo puede incluir letras, números, puntos, guiones o guiones bajos.');
    }

    if (!isValidPassword(password)) {
      return renderError('La contraseña debe tener entre 6 y 72 caracteres.');
    }

    if (password !== confirm) {
      return renderError('Las contraseñas no coinciden.');
    }

    if (User.findByUsername(username)) {
      return renderError('Ese nombre de usuario ya está en uso. Prueba con otro.', 409);
    }

    const hash = await bcrypt.hash(password, 12);
    const user = User.create(username, hash);

    return beginSession(req, user, (error) => {
      if (error) return next(error);

      setFlash(req, 'success', `¡Cuenta creada! Ya eres parte de WikiLupe, ${user.username}.`);
      return res.redirect('/perfil');
    });
  } catch (error) {
    // Condición de carrera del UNIQUE de username.
    if (error && String(error.code).includes('SQLITE_CONSTRAINT')) {
      return res.status(409).render('auth/register', {
        title: 'Crear cuenta',
        form: { username: clean(req.body.username, 24) },
        error: 'Ese nombre de usuario ya está en uso. Prueba con otro.'
      });
    }
    return next(error);
  }
}

function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie('wikilupe.sid');
    return res.redirect('/');
  });
}

module.exports = {
  showLogin,
  login,
  showRegister,
  register,
  logout
};
