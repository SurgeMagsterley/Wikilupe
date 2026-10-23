const path = require('path');
const fs = require('fs');

function uploadPath(subdir, filename) {
  return path.join(__dirname, '..', 'public', 'uploads', subdir, filename);
}

function removeFile(subdir, filename) {
  if (!filename) return;

  try {
    fs.unlinkSync(uploadPath(subdir, filename));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`No se pudo borrar ${subdir}/${filename}:`, error.message);
    }
  }
}

/**
 * Si una petición multipart falla en la validación, borramos los archivos
 * temporales que Multer ya había guardado.
 */
function cleanupUploads(files, subdir = 'characters') {
  if (!Array.isArray(files)) return;
  files.forEach((file) => removeFile(subdir, file.filename));
}

function removeCharacterFiles(filenames) {
  (filenames || []).forEach((filename) => removeFile('characters', filename));
}

module.exports = {
  removeFile,
  cleanupUploads,
  removeCharacterFiles
};
