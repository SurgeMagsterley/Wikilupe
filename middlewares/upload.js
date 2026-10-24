const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { supabase, STORAGE_BUCKET } = require('../config/supabase');

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};

const storage = multer.memoryStorage();

function fileFilter(req, file, callback) {
  if (ALLOWED_TYPES.has(file.mimetype)) return callback(null, true);
  const error = new Error('Solo se permiten imágenes JPG, PNG, WEBP o GIF.');
  error.status = 400;
  return callback(error);
}

async function uploadToSupabase(buffer, mimetype, originalname, subdir) {
  const random = crypto.randomBytes(6).toString('hex');
  const extension = EXTENSIONS[mimetype] || path.extname(originalname).toLowerCase() || '.jpg';
  const filename = `${Date.now()}-${uuidv4().split('-')[0]}-${random}${extension}`;
  const filepath = `${subdir}/${filename}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filepath, buffer, {
      contentType: mimetype,
      upsert: false
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filepath);
  return {
    filename: filepath,
    publicUrl: data.publicUrl
  };
}

const avatarUpload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024, files: 1 },
  fileFilter
});

const characterUpload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 13 },
  fileFilter
});

module.exports = {
  avatarUpload,
  characterUpload,
  uploadToSupabase
};
