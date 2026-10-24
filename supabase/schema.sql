-- Esquema para Supabase Postgres (Wikilupe)
-- Copiar y pegar TODO este contenido en SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar TEXT,
  is_admin INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users (LOWER(username));

CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
)
WITH (OIDS=FALSE);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON session ("expire");

CREATE TABLE IF NOT EXISTS characters (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  element TEXT NOT NULL DEFAULT '',
  sexuality TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'secundario',
  stat_physical_attack INTEGER,
  stat_special_attack INTEGER,
  stat_physical_defense INTEGER,
  stat_special_defense INTEGER,
  stat_speed INTEGER,
  titles TEXT NOT NULL DEFAULT '',
  feats TEXT NOT NULL DEFAULT '',
  combat_style TEXT NOT NULL DEFAULT '',
  combat_role TEXT NOT NULL DEFAULT '',
  marital_status TEXT NOT NULL DEFAULT '',
  life_status TEXT NOT NULL DEFAULT '',
  birthday TEXT NOT NULL DEFAULT '',
  age TEXT NOT NULL DEFAULT '',
  powers TEXT NOT NULL DEFAULT '',
  universe TEXT NOT NULL DEFAULT '',
  affiliations TEXT NOT NULL DEFAULT '',
  religion TEXT NOT NULL DEFAULT '',
  species TEXT NOT NULL DEFAULT '',
  bg_color TEXT NOT NULL DEFAULT '',
  bg_image TEXT NOT NULL DEFAULT '',
  history TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_characters_user ON characters (user_id);
CREATE INDEX IF NOT EXISTS idx_characters_role ON characters (role);

CREATE TABLE IF NOT EXISTS character_images (
  id SERIAL PRIMARY KEY,
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  nickname TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_images_character ON character_images (character_id);

CREATE TABLE IF NOT EXISTS character_facts (
  id SERIAL PRIMARY KEY,
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_facts_character ON character_facts (character_id);

CREATE TABLE IF NOT EXISTS relations (
  id SERIAL PRIMARY KEY,
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  related_character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
  external_name TEXT,
  relation_type TEXT NOT NULL CHECK (relation_type IN ('familiar', 'amigo', 'conocido')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CHECK (related_character_id IS NOT NULL OR (external_name IS NOT NULL AND TRIM(external_name) <> ''))
);

CREATE INDEX IF NOT EXISTS idx_relations_character ON relations (character_id);
CREATE INDEX IF NOT EXISTS idx_relations_related ON relations (related_character_id);
