# Architecture

The Atlas mirrors the ecosystem of Alisson's portfolio (`alis-portfolio`, `alis-portfolio-api`, `alis-design-system`): same stack, folder layout and rules, in its own repos.

## Repos (siblings, GitHub owner `alishenriques`, all public)

| Repo | Package | Role | Deploy |
|---|---|---|---|
| `atlas-migracoes` | (private app) | Next.js App Router front-end and, later, the admin area; main repo and source of these docs | Vercel |
| `atlas-migracoes-api` | `@alishenriques/atlas-migracoes-api` | GraphQL API, database, spreadsheet importer | Vercel function |
| `atlas-migracoes-design-system` | `@alishenriques/atlas-design-system` | React components and `--atlas-*` tokens | npm, via GitHub Actions on `v*` tags |

## Data flow

Next.js server components → Axios POST to `NEXT_PUBLIC_GRAPHQL_URL` → GraphQL Yoga → in-memory dataset loaded per request through Drizzle → Neon Postgres. Responses are parsed with Zod on the front-end as well (`src/lib/schemas.ts`).

The spreadsheets enter the database once, from the importer CLI in the API repo (`yarn import:xlsx --dir <folder>`), run on Alisson's machine against Neon. The admin import screen planned for stage 3 reuses the same parser.

## Data model (API)

Source of truth: `atlas-migracoes-api/src/schemas/domain.ts` (Zod) and `src/db/schema.ts` (Drizzle).

- `places`: hierarchical names exactly as written in the source (historical names kept), slug id of the path, `currentName` from "[atual X]", `lat`/`lng` null until geocoded.
- `artists`: name, slug, birth/death place and date.
- `works` (id = MAC USP tombo), `exhibitions` (EH./EX./EM. ids) and `publications` (PB. ids), linked through `work_exhibitions` and `work_publications`.
- `import_batches`: one row per import with counts, unresolved references and warnings, for review.
- **`FuzzyDate`** (jsonb): `{ raw, year, endYear, iso, precision }`, precision `day | month | year | circa | range | unknown`. The UI must render a date according to its precision, never as more exact than it is.

What the data does **not** have: arrival year or route to Brazil, images. The trajectory is drawn from known points (birth, exhibitions by date and place, death) until the migration event becomes editable in the admin area.

## API (`atlas-migracoes-api`)

- `src/app.ts`: `createApp(env, { db })` builds the Yoga instance; used by `src/index.ts` (local) and `api/graphql.ts` (Vercel). `vercel.json` rewrites `/graphql`.
- `src/graphql/schema.ts`: read-only queries `meta`, `stats`, `artists(filter)`, `artist(slug)`, `places`, `exhibitions(placeId)`, `work(id)`. Throw `GraphQLError` for client-visible errors (`BAD_USER_INPUT`).
- **Demo mode:** without `DATABASE_URL` the API serves a few simulated records (`src/db/fallback.ts`) and `meta.source` is `demo`; the app shows `DemoNotice` whenever it sees that.
- **Tests:** PGlite with the real migrations; the importer is tested end to end with a workbook generated in the test (same headers and quirks as the real export).

## Front-end (`atlas-migracoes`)

Same modular structure as `alis-portfolio`:

```
src/
  app/[locale]/       # routes only; each page.tsx is a thin wrapper delegating to a module
  i18n/               # next-intl: routing.ts (localized pathnames), navigation.ts, request.ts
  locales/            # pt.json, en.json, nested UPPER_CASE namespaces; keys must match (locales.test.ts)
  proxy.ts            # Next 16's middleware (renamed), runs next-intl
  modules/<module>/   # <Name>.tsx, styles/index.styles.ts, tests/, components/<Sub>/..., constants/
  shared/components/  # reused across modules but specific to the Atlas (DemoNotice, ComingSoon)
  lib/                # env.ts, graphql-client.ts, schemas.ts, atlas.ts (queries)
```

- Routes: `/` Explorar, `/trajetorias` (`/en/trajectories`), `/camada-historica` (`/en/historical-layer`), `/sobre` (`/en/about`). `[...rest]` sends unknown paths to the localized 404.
- `app/[locale]/layout.tsx` is the root layout: fonts via `next/font` (Cormorant Garamond for headings, Inter for UI), DS stylesheet, then `globals.css`, which points `--atlas-font-*` at the self-hosted fonts and maps the tokens into Tailwind (`bg-background`, `text-muted`, `text-accent`, `border-line`, `font-serif`).
- Always import navigation from `@/i18n/navigation`, not `next/link`.
- Pages that read collection data use `dynamic = "force-dynamic"` (Axios, not `fetch`, so Next can't infer it) and render a fallback when the API is unreachable instead of failing.

## Visual direction

The dark Atlas screens in the project deck (`ap_MIGRACOES.pptx`, slides 12–21): night-blue surfaces, one gold accent, serif headings, small uppercase sans labels, translucent panels over the map, a reliability tag (documented, inferred, undetermined) next to claims. Single dark theme by design.

## Planned additions (see roadmap)

- Map: MapLibre GL with `react-map-gl`, OpenFreeMap vector tiles restyled to the night-blue palette, Turf great-circle arcs for trajectories.
- Historical layers: borders by year from `historical-basemaps` (GeoJSON); license and credit to confirm before publishing.
- Geocoding: a one-time Nominatim script plus manual review, stored in `places`; never a live lookup.
- Admin: Better Auth with the Drizzle adapter, sessions in Postgres, roles admin and researcher.
- E2E: one Playwright smoke flow (map, artist record, login) before each deploy.
- Later: Gemini behind an API service for IA Relacional.

## Design system consumption

The app installs `@alishenriques/atlas-design-system` from npm (`^0.1.0`, first published 2026-10-17). New DS versions are released from the DS repo by bumping `version` and pushing a `v*` tag, which runs its publish workflow through npm Trusted Publishing; then bump the range here if the release is a new minor or major. To test unreleased DS changes, temporarily point the dependency at a commit (`github:alishenriques/atlas-migracoes-design-system#commit=…`; Yarn builds it through `prepack`) and never merge that pin.
