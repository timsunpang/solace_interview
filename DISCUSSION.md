# Discussion
Given more time, I would have added the following:
- Individualized .env files for each environment (dev, test, prod). I added .env to .gitignore so that it's not committed but in a real project we'd probably use several different .env files.
- Append the query params to the url to allow for more granular search and caching.
- Add filters to the search table (e.g. years of experience, specialties, city, etc). As implemented, search will match on names, city, degree, and specialties.
- Add a "contact" button on the AdvocateDetail page which opens a form to send an email to the advocate.


# Scripts
Large Seed (Python + Faker)
- File: `scripts/seed_10k_advocates.py`
- Requirements: Python 3, packages `psycopg2-binary` and `Faker`.
- Install packages:
  - PowerShell/CMD: `pip install psycopg2-binary Faker`
- Run with your database URL set:
  - PowerShell
    - `$env:DATABASE_URL="postgresql://postgres:password@localhost/solaceassignment"`
    - `python scripts/seed_10k_advocates.py 10000`
  - macOS/Linux
    - `export DATABASE_URL=postgresql://postgres:password@localhost/solaceassignment`
    - `python3 scripts/seed_10k_advocates.py 10000`
- Notes:
  - The script batches inserts for performance.
  - You can pass any count (default is 10,000).

# Migrations
- Cleanup (remove last 10k rows):
  - File: `drizzle/0001_delete_last_10k_advocates.sql`
  - Deletes the 10,000 highest `id` rows and resets the sequence.
  - Warning: Assumes that the bulk insert script was run first.

- Add indexes for faster search:
  - File: `drizzle/0002_add_advocates_indexes.sql`
  - Enables `pg_trgm`, adds trigram GIN indexes on `first_name`, `last_name`, `city`, `degree` and a GIN index on JSONB `payload`.

- Drop those indexes:
  - File: `drizzle/0003_drop_advocates_indexes.sql`
  - Removes the previously added indexes (keeps `pg_trgm` extension).
