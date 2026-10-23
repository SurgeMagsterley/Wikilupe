const bcrypt = require('bcryptjs');
const Character = require('../models/Character');
const User = require('../models/User');
const { setFlash } = require('../middlewares/auth');
const { removeFile } = require('../utils/files');
const { destroyUserSessions } = require('../utils/sessions');
const { isValidPassword } = require('../utils/validation');

function show(req, res) {
  const characters = Character.listByUser(req.user.id);
  const totalPhotos = characters.reduce((total, character) => total + (character.image_count || 0), 0);

  return res.render('profile', {
    title: 'Mi perfil',
    characters,
    totalPhotos
  });
}

function listPublic(req, res) {
  const users = User.listAll();
  const usersWithFeatured = users.map((account) => ({
    ...account,
    featured: Character.featuredByUser(account.id, 3)
  }));

  return res.render('users/index', {
    title: 'Perfiles de la comunidad',
    users: usersWithFeatured
  });
}

function publicShow(req, res) {
  const account = User.findByUsername(req.params.username);

  if (!account) {
    return res.status(404).render('errors/404', { title: 'Perfil no encontrado' });
  }

  const characters = Character.listByUser(account.id);
  const totalPhotos = characters.reduce((total, character) => total + (character.image_count || 0), 0);

  return res.render('users/show', {
    title: `@${account.username}`,
    account,
    characters,
    totalPhotos
  });
}

function updateAvatar(req, res) {
  const file = req.file;

  if (!file) {
    setFlash(req, 'error', 'Elige una imagen para usar como foto de perfil.');
    return res.redirect('/perfil');
  }

  const previousAvatar = req.user.avatar;
  User.updateAvatar(req.user.id, file.filename);

  if (previousAvatar) {
    removeFile('avatars', previousAvatar);
  }

  setFlash(req, 'success', 'Foto de perfil actualizada.');
  return res.redirect('/perfil');
}

async function changePassword(req, res, next) {
  try {
    const currentPassword = String(req.body.current_password || '');
    const newPassword = String(req.body.new_password || '');
    const confirmPassword = String(req.body.confirm_password || '');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setFlash(req, 'error', 'Completa los tres campos para cambiar la contraseña.');
      return res.redirect('/perfil#seguridad');
    }

    const matches = await bcrypt.compare(currentPassword, req.user.password_hash);
    if (!matches) {
      setFlash(req, 'error', 'Tu contraseña actual no es correcta.');
      return res.redirect('/perfil#seguridad');
    }

    if (!isValidPassword(newPassword)) {
      setFlash(req, 'error', 'La contraseña nueva debe tener entre 6 y 72 caracteres.');
      return res.redirect('/perfil#seguridad');
    }

    if (newPassword !== confirmPassword) {
      setFlash(req, 'error', 'La contraseña nueva y su confirmación no coinciden.');
      return res.redirect('/perfil#seguridad');
    }

    const hash = await bcrypt.hash(newPassword, 12);
    User.updatePassword(req.user.id, hash);
    destroyUserSessions(req.user.id, req.sessionID);

    setFlash(req, 'success', 'Contraseña actualizada correctamente.');
    return res.redirect('/perfil#seguridad');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  show,
  listPublic,
  publicShow,
  updateAvatar,
  changePassword
};
