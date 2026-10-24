const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[aviso] SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están definidos. Las subidas a Supabase Storage no funcionarán.');
}

const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'wikilupe-uploads';

module.exports = {
  supabase,
  STORAGE_BUCKET
};
