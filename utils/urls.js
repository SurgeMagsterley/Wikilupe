const { supabase, STORAGE_BUCKET } = require('../config/supabase');

function getImageUrl(filename) {
  if (!filename) return '';
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

module.exports = {
  getImageUrl
};
