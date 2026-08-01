import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, entriesTable } from "@workspace/db";
import {
  SaveEntryBody,
  SaveEntryResponse,
  GetEntryParams,
  GetEntryResponse,
  DeleteEntryParams,
  ListEntriesQueryParams,
  ListEntriesResponseItem,
} from "@workspace/api-zod";

const router: IRouter = Router();

// GET /entries
router.get("/entries", async (req, res): Promise<void> => {
  const qp = ListEntriesQueryParams.safeParse(req.query);
  if (!qp.success) {
    res.status(400).json({ error: qp.error.message });
    return;
  }

  const limit = Math.min(Number(qp.data.limit ?? 50), 200);

  let query = db
    .select()
    .from(entriesTable)
    .orderBy(desc(entriesTable.createdAt))
    .limit(limit);

  const rows = await query;

  // Client-side filter by category/tag (small dataset expected)
  let filtered = rows;
  if (qp.data.category) {
    const cat = qp.data.category.toLowerCase();
    filtered = filtered.filter(
      (e) => e.categories?.some((c: string) => c.toLowerCase() === cat),
    );
  }
  if (qp.data.tag) {
    const t = qp.data.tag.toLowerCase();
    filtered = filtered.filter(
      (e) => e.tags?.some((tag: string) => tag.toLowerCase() === t),
    );
  }

  res.json(filtered.map((e) => ListEntriesResponseItem.parse({
    ...e,
    corrections: e.corrections ?? [],
    tags: e.tags ?? [],
    categories: e.categories ?? [],
    inferredConnections: e.inferredConnections ?? [],
    createdAt: e.createdAt.toISOString(),
  })));
});

// POST /entries
router.post("/entries", async (req, res): Promise<void> => {
  const parsed = SaveEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [entry] = await db
    .insert(entriesTable)
    .values({
      originalText: parsed.data.originalText,
      correctedText: parsed.data.correctedText,
      corrections: parsed.data.corrections as unknown as object[],
      tags: parsed.data.tags,
      categories: parsed.data.categories,
      inferredConnections: parsed.data.inferredConnections,
      frontmatterYaml: parsed.data.frontmatterYaml,
      obsidianMarkdown: parsed.data.obsidianMarkdown,
    })
    .returning();

  res.status(201).json(SaveEntryResponse.parse({
    ...entry,
    corrections: entry.corrections ?? [],
    tags: entry.tags ?? [],
    categories: entry.categories ?? [],
    inferredConnections: entry.inferredConnections ?? [],
    createdAt: entry.createdAt.toISOString(),
  }));
});

// GET /entries/:id
router.get("/entries/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetEntryParams.safeParse({ id: Number(rawId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [entry] = await db
    .select()
    .from(entriesTable)
    .where(eq(entriesTable.id, params.data.id));

  if (!entry) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }

  res.json(GetEntryResponse.parse({
    ...entry,
    corrections: entry.corrections ?? [],
    tags: entry.tags ?? [],
    categories: entry.categories ?? [],
    inferredConnections: entry.inferredConnections ?? [],
    createdAt: entry.createdAt.toISOString(),
  }));
});

// DELETE /entries/:id
router.delete("/entries/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteEntryParams.safeParse({ id: Number(rawId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(entriesTable)
    .where(eq(entriesTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
