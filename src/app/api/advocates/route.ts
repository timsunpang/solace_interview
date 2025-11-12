import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";
import { ilike, or, sql } from "drizzle-orm";

// Simple in-memory cache for popular queries (toy app)
type CachedPayload = { body: any; headers: Record<string, string>; expires: number };
const cache = new Map<string, CachedPayload>();
const ONE_MINUTE = 60 * 1000;
const FIVE_MINUTES = 5 * ONE_MINUTE;

function cacheKey(params: { q: string; page: number; limit: number }) {
  return JSON.stringify(params);
}

function getCached(key: string) {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expires > now) return hit;
  if (hit) cache.delete(key);
  return null;
}

function setCached(key: string, body: any, ttlMs: number) {
  cache.set(key, {
    body,
    headers: {
      "Cache-Control": `public, max-age=${Math.floor(ttlMs / 1000)}, stale-while-revalidate=${Math.floor(FIVE_MINUTES / 1000)}`,
    },
    expires: Date.now() + ttlMs,
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = (searchParams.get("searchQuery") || "").trim();
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));
    const offset = (page - 1) * limit;
    const shouldCache = !searchQuery && page === 1 && limit === 20;
    const key = cacheKey({ q: searchQuery, page, limit });

    // Serve from in-memory cache for "ALL" first page
    if (shouldCache) {
      const hit = getCached(key);
      if (hit) {
        return Response.json(hit.body, { headers: hit.headers });
      }
    }

    // Fallback to in-memory data when DB isn't configured
    const useFallback = !process.env.DATABASE_URL;

    if (!searchQuery) {
      if (useFallback) {
        const all = advocateData.map((a, i) => ({ id: i + 1, ...a }));
        const total = all.length;
        const data = all.slice(offset, offset + limit);
        const body = { data, meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) } };
        if (shouldCache) {
          setCached(key, body, FIVE_MINUTES);
          const hit = getCached(key)!;
          return Response.json(hit.body, { headers: hit.headers });
        }
        return Response.json(body);
      }

      const [{ count }] = (await db
        .select({ count: sql<number>`count(*)`.mapWith((n) => Number(n)) })
        .from(advocates)) as any;

      const data = await db.select().from(advocates).limit(limit).offset(offset);
      const total = Number(count ?? 0);
      const body = { data, meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) } };
      if (shouldCache) {
        setCached(key, body, FIVE_MINUTES);
        const hit = getCached(key)!;
        return Response.json(hit.body, { headers: hit.headers });
      }
      return Response.json(body);
    }

    // With a query, filter results
    if (useFallback) {
      const q = searchQuery.toLowerCase();
      const withIds = advocateData.map((a, i) => ({ id: i + 1, ...a }));
      const filtered = withIds.filter((a) =>
        `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
        a.firstName.toLowerCase().includes(q) ||
        a.lastName.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.degree.toLowerCase().includes(q) ||
        (Array.isArray(a.specialties) && a.specialties.some((s) => s.toLowerCase().includes(q)))
      );
      const total = filtered.length;
      const data = filtered.slice(offset, offset + limit);
      return Response.json({ data, meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) } });
    }

    const term = `%${searchQuery}%`;
    const whereClause = or(
      ilike(advocates.firstName, term),
      ilike(advocates.lastName, term),
      ilike(advocates.city, term),
      ilike(advocates.degree, term),
      sql`(${advocates.firstName} || ' ' || ${advocates.lastName}) ILIKE ${term}`,
      sql`EXISTS (
            SELECT 1
            FROM jsonb_array_elements_text(
              CASE
                WHEN jsonb_typeof(${advocates.specialties}) = 'array' THEN ${advocates.specialties}
                ELSE '[]'::jsonb
              END
            ) AS s
            WHERE s ILIKE ${term}
          )`
    );

    const [{ count }] = (await db
      .select({ count: sql<number>`count(*)`.mapWith((n) => Number(n)) })
      .from(advocates)
      .where(whereClause)) as any;

    const data = await db
      .select()
      .from(advocates)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    const total = Number(count ?? 0);
    return Response.json({ data, meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) } });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
