const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};

function storageFor(subdir) {
  const directory = path.join(__dirname, '..', 'public', 'uploads', subdir);
  fs.mkdirSync(directory, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, callback) => callback(null, directory),
    filename: (req, file, callback) => {
      const random = crypto.randomBytes(8).toString('hex');
      const extension = EXTENSIONS[file.mimetype] || path.extname(file.originalname).toLowerCase() || '.jpg';
      callback(null, `${Date.now()}-${random}${extension}`);
    }
  });
}

function fileFilter(req, file, callback) {
  if (ALLOWED_TYPES.has(file.mimetype)) return callback(null, true);
  const error = new Error('Solo se permiten imágenes JPG, PNG, WEBP o GIF.');
  error.status = 400;
  return callback(error);
}

const avatarUpload = multer({
  storage: storageFor('avatars'),
  limits: { fileSize: 4 * 1024 * 1024, files: 1 },
  fileFilter
});

const characterUpload = multer({
  storage: storageFor('characters'),
  limits: { fileSize: 8 * 1024 * 1024, files: 13 },
  fileFilter
});

module.exports = {
  avatarUpload,
  characterUpload
};
