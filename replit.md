# noXcuro — Constelaciones Rizomiceliales

_Procesador de texto personal: corrige solo ortografía/acentuación (siempre en minúsculas), genera frontmatter YAML completo para Obsidian con tags, categorías del sistema noXcuro, y conexiones semánticas sugeridas._

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- API contract: `lib/api-spec/openapi.yaml`
- Text processing logic: `artifacts/api-server/src/lib/textProcessor.ts`
- DB schema: `lib/db/src/schema/entries.ts`
- API routes: `artifacts/api-server/src/routes/{process,entries,stats}.ts`
- Frontend: `artifacts/noxcuro/src/`

## Architecture decisions

- **Solo corrección ortográfica**: el procesador solo cambia palabras que están en el diccionario de correcciones; nunca agrega, elimina ni reordena palabras. La salida siempre es minúsculas.
- **Conexiones siempre inferidas**: todas las conexiones se marcan explícitamente como "sugerido/inferido" en el Markdown. Nunca se presentan como hechos.
- **LLM-ready**: la ruta `/api/process` hace todo el análisis en reglas determinísticas por ahora; el campo `llm_analisis: pendiente` en el frontmatter indica que puede conectarse un LLM real sin cambiar la arquitectura.
- **Spell dictionary en servidor**: el diccionario de correcciones ortográficas vive en `textProcessor.ts`; puede expandirse fácilmente o reemplazarse con llamadas a un LLM/API lingüística.

## Product

- **Procesador** (`/`): pega texto bruto → corrección ortográfica + lowercase → tags, categorías noXcuro, conexiones sugeridas + Markdown Obsidian listo para copiar. Botón "guardar en historial".
- **Constelación** (`/entradas`): historial de todas las entradas guardadas, filtrable por categoría y tag.
- **Grafo** (`/estadisticas`): vista de salud del sistema — total de entradas, desglose por categorías, tags más frecuentes, correcciones realizadas.

## User preferences

- Regla absoluta: NUNCA cambiar, sustituir, eliminar, agregar ni reordenar ninguna palabra del texto original. Solo correcciones ortográficas/acentuación. Siempre minúsculas.
- Categorías del sistema noXcuro: Método, Cosmogonía, Museo, Escritura, Identidad, Leyes.

## Gotchas

- Después de cambiar `lib/api-spec/openapi.yaml`, correr `pnpm --filter @workspace/api-spec run codegen` antes de tocar el frontend.
- El campo `integer` en OpenAPI genera `zod.int()` (Zod v4 API) que no existe en v3; usar `number` en el spec.
- Expandir el diccionario en `textProcessor.ts` para agregar más correcciones comunes del usuario.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
