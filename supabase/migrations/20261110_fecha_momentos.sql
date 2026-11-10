-- Fecha propia de cada momento de la cronología.
-- Los momentos existentes toman como fecha el día en que se publicaron.
ALTER TABLE IF EXISTS public.timeline_events
  ADD COLUMN IF NOT EXISTS event_date DATE;

UPDATE public.timeline_events
SET event_date = created_at::date
WHERE event_date IS NULL;

ALTER TABLE public.timeline_events
  ALTER COLUMN event_date SET DEFAULT CURRENT_DATE;

ALTER TABLE public.timeline_events
  ALTER COLUMN event_date SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_timeline_events_event_date
  ON public.timeline_events (event_date, created_at);
