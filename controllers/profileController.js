const bcrypt = require('bcryptjs');
const Character = require('../models/Character');
const User = require('../models/User');
const { setFlash } = require('../middlewares/auth');
const { removeFile } = require('../utils/files');
const { destroyUserSessions } = require('../utils/sessions');
const { isValidPassword } = require('../utils/validation');
const { uploadToSupabase } = require('../middlewares/upload');

async function show(req, res) {
  const characters = await Character.listByUser(req.user.id);
  const totalPhotos = characters.reduce((total, character) => total + (parseInt(character.image_count, 10) || 0), 0);

  return res.render('profile', {
    title: 'Mi perfil',
    characters,
    totalPhotos
  });
}

async function listPublic(req, res) {
  const users = await User.listAll();
  const usersWithFeatured = [];
  for (let i = 0; i < users.length; i += 1) {
    const account = users[i];
    const featured = await Character.featuredByUser(account.id, 3);
    usersWithFeatured.push({
      ...account,
      featured
    });
  }

  return res.render('users/index', {
    title: 'Perfiles de la comunidad',
    users: usersWithFeatured
  });
}

async function publicShow(req, res) {
  const account = await User.findByUsername(req.params.username);

  if (!account) {
    return res.status(404).render('errors/404', { title: 'Perfil no encontrado' });
  }

  const characters = await Character.listByUser(account.id);
  const totalPhotos = characters.reduce((total, character) => total + (parseInt(character.image_count, 10) || 0), 0);

  return res.render('users/show', {
    title: `@${account.username}`,
    account,
    characters,
    totalPhotos
  });
}

async function updateAvatar(req, res) {
  const file = req.file;

  if (!file) {
    setFlash(req, 'error', 'Elige una imagen para usar como foto de perfil.');
    return res.redirect('/perfil');
  }

  try {
    const uploaded = await uploadToSupabase(file.buffer, file.mimetype, file.originalname, 'avatars');
    const previousAvatar = req.user.avatar;
    await User.updateAvatar(req.user.id, uploaded.filename);

    if (previousAvatar) {
      removeFile('avatars', previousAvatar);
    }

    setFlash(req, 'success', 'Foto de perfil actualizada.');
    return res.redirect('/perfil');
  } catch (error) {
    console.error('Error subiendo avatar:', error.message);
    setFlash(req, 'error', 'No se pudo subir la foto de perfil.');
    return res.redirect('/perfil');
  }
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
    await User.updatePassword(req.user.id, hash);
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
