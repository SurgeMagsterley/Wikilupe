const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Character = require('../models/Character');
const CharacterImage = require('../models/CharacterImage');
const Relation = require('../models/Relation');
const { setFlash } = require('../middlewares/auth');
const { removeFile, removeCharacterFiles } = require('../utils/files');
const { destroyUserSessions } = require('../utils/sessions');
const { isValidPassword } = require('../utils/validation');

function index(req, res) {
  const users = User.listAll();
  const characters = Character.list({});

  return res.render('admin/index', {
    title: 'Panel de administración',
    users,
    latestCharacters: characters.slice(0, 8),
    stats: {
      users: User.count(),
      characters: Character.count(),
      images: CharacterImage.count(),
      relations: Relation.count()
    }
  });
}

async function resetPassword(req, res, next) {
  try {
    if (req.params.id === String(req.user.id)) {
      setFlash(req, 'error', 'Para cambiar tu propia contraseña usa "Mi perfil".');
      return res.redirect('/admin');
    }

    const target = User.findById(req.params.id);

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
    User.updatePassword(target.id, hash);
    destroyUserSessions(target.id);

    setFlash(req, 'success', `Contraseña de "${target.username}" actualizada manualmente.`);
    return res.redirect('/admin');
  } catch (error) {
    return next(error);
  }
}

function deleteUser(req, res) {
  const target = User.findById(req.params.id);

  if (!target) {
    setFlash(req, 'error', 'Ese usuario no existe.');
    return res.redirect('/admin');
  }

  if (target.id === req.user.id) {
    setFlash(req, 'error', 'No puedes eliminar tu propia cuenta desde el panel.');
    return res.redirect('/admin');
  }

  const characters = Character.listByUser(target.id);
  const filenames = characters.flatMap((character) => CharacterImage.listFilenames(character.id));

  User.remove(target.id);
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
