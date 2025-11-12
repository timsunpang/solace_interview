#!/usr/bin/env python3
import os
import sys
import random
import time
from typing import List

try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    print("Missing dependency: psycopg2. Install with: pip install psycopg2-binary", file=sys.stderr)
    sys.exit(1)

try:
    from faker import Faker
except ImportError:
    print("Missing dependency: Faker. Install with: pip install Faker", file=sys.stderr)
    sys.exit(1)


DEGREES = ["MD", "PhD", "MSW", "DO", "RN", "NP", "PsyD"]
SPECIALTIES = [
    "Bipolar",
    "LGBTQ",
    "Medication/Prescribing",
    "Suicide History/Attempts",
    "General Mental Health (anxiety, depression, stress, grief, life transitions)",
    "Men's issues",
    "Relationship Issues (family, friends, couple, etc)",
    "Trauma & PTSD",
    "Personality disorders",
    "Personal growth",
    "Substance use/abuse",
    "Pediatrics",
    "Women's issues (post-partum, infertility, family planning)",
    "Chronic pain",
    "Weight loss & nutrition",
    "Eating disorders",
    "Diabetic Diet and nutrition",
    "Coaching (leadership, career, academic and wellness)",
    "Life coaching",
    "Obsessive-compulsive disorders",
    "Neuropsychological evaluations & testing (ADHD testing)",
    "Attention and Hyperactivity (ADHD)",
    "Sleep issues",
    "Schizophrenia and psychotic disorders",
    "Learning disorders",
    "Domestic abuse",
]


def pick_specialties() -> List[str]:
    count = random.randint(1, 5)
    return random.sample(SPECIALTIES, count)


def main():
    try:
        total = int(sys.argv[1]) if len(sys.argv) > 1 else 10000
    except ValueError:
        print("Usage: seed_10k_advocates.py [count]", file=sys.stderr)
        sys.exit(1)

    dsn = os.getenv("DATABASE_URL")
    if not dsn:
        print("DATABASE_URL is not set", file=sys.stderr)
        sys.exit(1)

    fake = Faker()
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()

    sql = (
        "INSERT INTO advocates (first_name, last_name, city, degree, payload, years_of_experience, phone_number) "
        "VALUES (%s, %s, %s, %s, %s::jsonb, %s, %s)"
    )

    batch = []
    batch_size = 1000
    inserted = 0
    start = time.time()

    try:
        for i in range(total):
            first = fake.first_name()
            last = fake.last_name()
            city = fake.city()
            degree = random.choice(DEGREES)
            specs = pick_specialties()
            years = random.randint(1, 30)
            phone = random.randint(2000000000, 9999999999)

            # psycopg2 will serialize Json(specs) correctly; the SQL casts to jsonb
            batch.append((first, last, city, degree, psycopg2.extras.Json(specs), years, phone))

            if len(batch) >= batch_size:
                psycopg2.extras.execute_batch(cur, sql, batch, page_size=batch_size)
                conn.commit()
                inserted += len(batch)
                batch.clear()
                print(f"Inserted {inserted}/{total}...")

        if batch:
            psycopg2.extras.execute_batch(cur, sql, batch, page_size=len(batch))
            conn.commit()
            inserted += len(batch)
            batch.clear()

        elapsed = time.time() - start
        print(f"Done. Inserted {inserted} advocates in {elapsed:.1f}s")
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    main()
