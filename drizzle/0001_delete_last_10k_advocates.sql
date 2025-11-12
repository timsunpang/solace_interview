-- Remove the last 10,000 advocates (by highest id)
-- WARNING: This assumes the seed inserted 10k most recently.

BEGIN;

WITH del AS (
  SELECT id FROM advocates ORDER BY id DESC LIMIT 10000
)
DELETE FROM advocates a
USING del
WHERE a.id = del.id;

-- Fix the sequence to the current max(id)
SELECT setval(pg_get_serial_sequence('advocates','id'), COALESCE((SELECT max(id) FROM advocates), 0), true);

COMMIT;

