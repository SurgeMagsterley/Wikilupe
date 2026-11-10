-- =========================================================
-- WikiLupe · Migración 2026-11-09
-- Cambios aditivos: no elimina personajes ni datos existentes.
-- Ejecutar una sola vez en Supabase → SQL Editor → Run.
-- =========================================================

BEGIN;

-- 1) Relaciones: nuevas categorías "pareja" y "casado"
-- Elimina cualquier CHECK previo que limite relation_type (sin importar su nombre).
DO $$
DECLARE
  constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'relations'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) LIKE '%relation_type%'
  LOOP
    EXECUTE format('ALTER TABLE relations DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;

ALTER TABLE relations ADD CONSTRAINT relations_relation_type_check
  CHECK (relation_type IN ('familiar', 'amigo', 'conocido', 'pareja', 'casado'));

-- 2) Imagen principal de cada personaje
ALTER TABLE character_images
  ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT FALSE;

-- Marca como principal la primera foto actual de cada personaje.
UPDATE character_images ci
SET is_primary = TRUE
WHERE ci.id IN (
  SELECT DISTINCT ON (character_id) id
  FROM character_images
  ORDER BY character_id, position ASC, id ASC
)
AND NOT EXISTS (
  SELECT 1 FROM character_images p
  WHERE p.character_id = ci.character_id AND p.is_primary
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_images_primary
  ON character_images (character_id)
  WHERE is_primary;

-- 3) Los 3 personajes destacados de cada usuario
ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS featured_rank SMALLINT;

ALTER TABLE characters DROP CONSTRAINT IF EXISTS characters_featured_rank_check;
ALTER TABLE characters ADD CONSTRAINT characters_featured_rank_check
  CHECK (featured_rank BETWEEN 1 AND 3);

CREATE UNIQUE INDEX IF NOT EXISTS idx_characters_featured_rank
  ON characters (user_id, featured_rank)
  WHERE featured_rank IS NOT NULL;

-- 4) Cronología de momentos clave
CREATE TABLE IF NOT EXISTS timeline_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('importante', 'relevante', 'principal', 'secundario', 'historia')),
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 700),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timeline_events_created ON timeline_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_events_category ON timeline_events (category);

CREATE TABLE IF NOT EXISTS timeline_event_characters (
  event_id INTEGER NOT NULL REFERENCES timeline_events(id) ON DELETE CASCADE,
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, character_id)
);

CREATE INDEX IF NOT EXISTS idx_timeline_event_characters_character
  ON timeline_event_characters (character_id);

COMMIT;
