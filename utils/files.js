const { supabase, STORAGE_BUCKET } = require('../config/supabase');

async function removeFileFromSupabase(filepath) {
  if (!filepath) return;
  try {
    await supabase.storage.from(STORAGE_BUCKET).remove([filepath]);
  } catch (error) {
    console.error(`No se pudo borrar ${filepath} de Supabase Storage:`, error.message);
  }
}

function removeFile(subdir, filename) {
  if (!filename) return;
  if (filename.includes('/')) {
    return removeFileFromSupabase(filename);
  }
  return removeFileFromSupabase(`${subdir}/${filename}`);
}

function cleanupUploads(files, subdir = 'characters') {
  if (!Array.isArray(files)) return;
  files.forEach((file) => {
    if (file.supabasePath) {
      removeFileFromSupabase(file.supabasePath);
    } else if (file.filename) {
      removeFile(subdir, file.filename);
    }
  });
}

function removeCharacterFiles(filenames) {
  if (!Array.isArray(filenames)) return;
  filenames.forEach((filename) => {
    if (filename.includes('/')) {
      removeFileFromSupabase(filename);
    } else {
      removeFileFromSupabase(`characters/${filename}`);
    }
  });
}

module.exports = {
  removeFile,
  cleanupUploads,
  removeCharacterFiles,
  removeFileFromSupabase
};
