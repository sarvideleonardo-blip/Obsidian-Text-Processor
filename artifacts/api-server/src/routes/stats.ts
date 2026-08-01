import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, entriesTable } from "@workspace/db";
import { GetStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats", async (req, res): Promise<void> => {
  // Total entries
  const [{ count: totalEntries }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(entriesTable);

  // All entries to compute category/tag/correction aggregates
  const allEntries = await db
    .select({
      categories: entriesTable.categories,
      tags: entriesTable.tags,
      corrections: entriesTable.corrections,
    })
    .from(entriesTable);

  // Category counts
  const catMap: Record<string, number> = {};
  for (const e of allEntries) {
    for (const cat of e.categories ?? []) {
      catMap[cat] = (catMap[cat] ?? 0) + 1;
    }
  }
  const categoryCounts = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({ category, count }));

  // Top tags
  const tagMap: Record<string, number> = {};
  for (const e of allEntries) {
    for (const tag of e.tags ?? []) {
      tagMap[tag] = (tagMap[tag] ?? 0) + 1;
    }
  }
  const topTags = Object.entries(tagMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([tag, count]) => ({ tag, count }));

  // Total corrections
  let totalCorrections = 0;
  for (const e of allEntries) {
    const corr = Array.isArray(e.corrections) ? e.corrections : [];
    totalCorrections += corr.length;
  }

  res.json(GetStatsResponse.parse({
    totalEntries,
    categoryCounts,
    topTags,
    totalCorrections,
  }));
});

export default router;
