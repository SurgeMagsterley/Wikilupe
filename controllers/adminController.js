const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Character = require('../models/Character');
const CharacterImage = require('../models/CharacterImage');
const Relation = require('../models/Relation');
const { setFlash } = require('../middlewares/auth');
const { removeFile, removeCharacterFiles } = require('../utils/files');
const { destroyUserSessions } = require('../utils/sessions');
const { isValidPassword } = require('../utils/validation');

async function index(req, res) {
  const [users, characters, userCount, charCount, imgCount, relCount] = await Promise.all([
    User.listAll(),
    Character.list({}),
    User.count(),
    Character.count(),
    CharacterImage.count(),
    Relation.count ? Relation.count() : Promise.resolve(0)
  ]);

  return res.render('admin/index', {
    title: 'Panel de administración',
    users,
    latestCharacters: characters.slice(0, 8),
    stats: {
      users: userCount,
      characters: charCount,
      images: imgCount,
      relations: relCount
    }
  });
}

async function resetPassword(req, res, next) {
  try {
    if (req.params.id === String(req.user.id)) {
      setFlash(req, 'error', 'Para cambiar tu propia contraseña usa "Mi perfil".');
      return res.redirect('/admin');
    }

    const target = await User.findById(req.params.id);

    if (!target) {
      setFlash(req, 'error', 'Ese usuario no existe.');
      return res.redirect('/admin');
    }

    const newPassword = String(req.body.new_password || '');

    if (!isValidPassword(newPassword)) {
      setFlash(req, 'error', 'La contraseña nueva debe tener entre 6 y 72 caracteres.');
      return res.redirect('/admin');
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await User.updatePassword(target.id, hash);
    destroyUserSessions(target.id);

    setFlash(req, 'success', `Contraseña de "${target.username}" actualizada manualmente.`);
    return res.redirect('/admin');
  } catch (error) {
    return next(error);
  }
}

async function deleteUser(req, res) {
  const target = await User.findById(req.params.id);

  if (!target) {
    setFlash(req, 'error', 'Ese usuario no existe.');
    return res.redirect('/admin');
  }

  if (target.id === req.user.id) {
    setFlash(req, 'error', 'No puedes eliminar tu propia cuenta desde el panel.');
    return res.redirect('/admin');
  }

  const characters = await Character.listByUser(target.id);
  const filenames = [];
  for (let i = 0; i < characters.length; i += 1) {
    const imgs = await CharacterImage.listFilenames(characters[i].id);
    filenames.push(...imgs);
  }

  await User.remove(target.id);
  destroyUserSessions(target.id);
  removeCharacterFiles(filenames);
  removeFile('avatars', target.avatar);

  setFlash(req, 'success', `Se eliminó la cuenta de "${target.username}" junto con sus personajes.`);
  return res.redirect('/admin');
}

module.exports = {
  index,
  resetPassword,
  deleteUser
};
