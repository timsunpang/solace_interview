-- Enable trigram extension for efficient ILIKE searches
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram GIN indexes for text fields commonly used in ILIKE searches
CREATE INDEX IF NOT EXISTS idx_advocates_first_name_trgm ON advocates USING gin (first_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_advocates_last_name_trgm  ON advocates USING gin (last_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_advocates_city_trgm       ON advocates USING gin (city gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_advocates_degree_trgm     ON advocates USING gin (degree gin_trgm_ops);

-- GIN index on JSONB specialties to speed containment-type queries
-- Note: this does not accelerate ILIKE-on-element patterns, but helps for
-- queries like: payload ? 'Bipolar' or payload @> '["Bipolar"]'
CREATE INDEX IF NOT EXISTS idx_advocates_specialties_gin ON advocates USING gin (payload);

