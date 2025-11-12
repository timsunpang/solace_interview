import db from "../../../../db";
import { advocates } from "../../../../db/schema";
import { advocateData } from "../../../../db/seed/advocates";
import { eq } from "drizzle-orm";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    const useFallback = !process.env.DATABASE_URL;

    if (useFallback) {
      const idx = id - 1;
      if (idx < 0 || idx >= advocateData.length) {
        return Response.json({ error: "Not Found" }, { status: 404 });
      }
      const data = { id, ...advocateData[idx] } as any;
      return Response.json({ data });
    }

    const rows = await db.select().from(advocates).where(eq(advocates.id, id)).limit(1);
    const data = rows[0];
    if (!data) return Response.json({ error: "Not Found" }, { status: 404 });
    return Response.json({ data });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

