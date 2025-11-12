-- Drop indexes created for text search and JSONB
DROP INDEX IF EXISTS idx_advocates_first_name_trgm;
DROP INDEX IF EXISTS idx_advocates_last_name_trgm;
DROP INDEX IF EXISTS idx_advocates_city_trgm;
DROP INDEX IF EXISTS idx_advocates_degree_trgm;
DROP INDEX IF EXISTS idx_advocates_specialties_gin;

