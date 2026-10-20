# Architecture

The Atlas mirrors the ecosystem of Alisson's portfolio (`alis-portfolio`, `alis-portfolio-api`, `alis-design-system`): same stack, folder layout and rules, in its own repos.

## Repos (siblings, GitHub owner `alishenriques`, all public)

| Repo | Package | Role | Deploy |
|---|---|---|---|
| `atlas-migracoes` | (private app) | Next.js App Router front-end and, later, the admin area; main repo and source of these docs | Vercel |
| `atlas-migracoes-api` | `@alishenriques/atlas-migracoes-api` | GraphQL API, database, spreadsheet importer | Vercel function |
| `atlas-migracoes-design-system` | `@alishenriques/atlas-design-system` | React components and `--atlas-*` tokens | npm, via GitHub Actions on `v*` tags |

## Labels and project board (decided by Alisson, 2026-10-18)

- **Every PR is linked to the project board** [Atlas Migrações (GitHub Project 4)](https://github.com/users/alishenriques/projects/4).
- **Every PR carries labels** for what it implements: the kind (`feature`, `fix`, `docs`, `chore`, `refactor`, `test`), the screen or module (`explorar`, `trajetorias`, `camada-historica`, `rede-relacional`, `ia-relacional`, `sobre`, `importer`, `design-system`…) and the stage (`stage-1`…`stage-4`).

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

What the data does **not** have: arrival year or route to Brazil, images. The map draws one line per artist, from the birthplace to the first documented place in Brazil (no intermediate routes, per the spec; decided by Alisson, 2026-10-18); exhibitions and the place of death are points. This holds until the migration event becomes editable in the admin area.

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
  shared/components/  # reused across modules but specific to the Atlas (DemoNotice, ComingSoon, AtlasMark)
  lib/                # env.ts, graphql-client.ts, schemas.ts, atlas.ts (queries)
```

- Routes: `/` Explorar, `/trajetorias` (`/en/trajectories`) with each artist's record at `/trajetorias/[slug]`, `/camada-historica` (`/en/historical-layer`), `/rede` (`/en/network`, `?artista=<slug>` opens it centered on that artist), `/sobre` (`/en/about`). `[...rest]` sends unknown paths to the localized 404.
- `app/[locale]/layout.tsx` is the root layout: fonts via `next/font` (Cormorant Garamond for headings, Inter for UI), DS stylesheet, then `globals.css`, which points `--atlas-font-*` at the self-hosted fonts and maps the tokens into Tailwind (`bg-background`, `text-muted`, `text-accent`, `border-line`, `font-serif`). It also renders Vercel Web Analytics and Speed Insights (`@vercel/analytics/next`, `@vercel/speed-insights/next`; free on Hobby, cookieless, reporting only on Vercel deployments, turned on in the Vercel project).
- Always import navigation from `@/i18n/navigation`, not `next/link`.
- **Explorar map** (`modules/home`): MapLibre GL 6 through `react-map-gl/maplibre`, loaded client-only with `next/dynamic`. MapLibre 6 looks for its worker next to its own module, so every client-only map imports `shared/map/worker.ts`, which calls `setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url))` and the bundler emits the worker as an asset. The basemap is a minimal style over OpenFreeMap vector tiles (free, no key): land and water only, colored from the `--atlas-*` tokens, with no present-day borders or place names (the borders of each period belong to the Camada Histórica). Trajectories are built in `lib/trajectory.ts` from the documented points only (birth, exhibitions of the works during the artist's lifetime, death), shown with an "inferred" reliability tag; posthumous exhibitions and points without a date or coordinates are counted, never drawn. Each artist's shown points are joined in date order by Turf great-circle arcs (`lib/mapFeatures.ts`); the legs from the birthplace to the first stop whose country is "Brasil" (`migrationLeg`, when both ends are in the shown period) are tagged `migration` and drawn solid gold, the other legs dashed and light, and the birthplace and first place in Brazil are gold points (decided by Alisson, 2026-10-20). With an artist selected, only that artist's lines are drawn and the other places are dimmed. The lines show the sequence of the records, not a documented route, and the screen says so.
- **Shared trajectory pieces**: `lib/trajectory.ts` and `lib/mapFeatures.ts` (pure, tested), `shared/components/TrajectoryMap` (client-only MapLibre map; import it from the folder index, which lazy-loads it) and `shared/components/TrajectoryStops` (the dated stop list with its "inferred" tag). Explorar and the Trajetórias record both use them.
- **Camada Histórica** (`modules/historical`): the borders file is fetched once on the client (`hooks/useStates`, validated with `statesSchema`) and drawn by `components/HistoricalMap` (client-only, like the trajectory map; it adds OpenFreeMap's free glyphs for state names, one label per state at its largest polygon, and keeps the view inside the clipped area). Decade (DS `SegmentedControl`) and year (`SelectField`) choose the day shown, 1 July. `utils/origins` reads each birthplace in the state at the artist's birth (`stateAtDate`, as uncertain as the date) and in the year shown.
- **Rede Relacional** (`modules/network`): one query (`getNetworkData`) brings each artist with their works and each work's exhibitions and publications; `lib/network.ts` (pure, tested) builds the graph in the browser. Node ids are prefixed by kind (`artist:`, `work:`, `exhibition:`, `publication:`, `institution:<normalized name>`, `place:`), and institutions spelled differently (case, accents, spacing) are one node. The overview links every artist to their birthplace and to the institutions (or, with no institution, the places) that showed their works, weighted by exhibitions; centering on an artist shows their works, the works' exhibitions and publications, those venues, birth and death places, and the other artists in the same exhibitions. The period filter keeps exhibitions and publications whose years touch it; undated records appear only with the full period, which spans the dated records of the base. Layout is `d3-force` run to rest before drawing (deterministic: d3 seeds its own random source); the graph is plain SVG with one focusable button per node and the DS `Legend`, `SelectField` and `YearRange`. Links are tagged "documented", since they come straight from the spreadsheets.
- **IA Relacional** (`modules/research`, route `/ia-relacional`, en `/relational-ai`): the artist is chosen in a `SelectField` and goes in the URL (`?artista=<slug>`, also linked from the record), so the server page asks the API for `research(slug)` and the screen is shareable. The collection's record (birth and death) sits beside the Wikidata person the API matched and why it was chosen (birth year or exact name), the Wikipedia summary, and each statement grouped by property with its `ReliabilityTag`, reference count, source link and review notes (present-day place names, dates that disagree with the collection). The sources consulted, when they were read and how the search works are always shown. With no certain match the screen says so and shows no findings; a Wikidata error is told apart from no match. Source links must be https (validated by Zod). Every finding is numbered by its position in `research.findings` (anchor `#achado-n`), and the AI summary (`research.summary`, written by Gemini in the API) links each `[n]` it cites to that finding; only citations of existing findings become links (`summaryParts` in `lib/research.ts`). When the API withholds the text (no key, rejected or error) the screen says why. The prompt sent to the model is shown in a collapsible block under the method, and the period's map the model is given (`research.period`: the state that held the birthplace on 1 July of the birth year and the states of Europe that day, from CShapes) has its own panel linked to the Camada Histórica.
- **Shared map pieces** (`shared/map`): `mapStyle.ts` (bare basemap, optional glyphs, token colors) and `worker.ts` (MapLibre worker URL, imported by every client-only map); `shared/hooks/useIsDesktop`.
- **Trajetórias record** (`modules/trajectories`): works, exhibitions and publications come straight from the MAC USP spreadsheets and are tagged "documented"; the trajectory is tagged "inferred". Unknown slugs go to the localized 404; a failed request to the error boundary.
- Pages that read collection data use `dynamic = "force-dynamic"` (Axios, not `fetch`, so Next can't infer it) and render a fallback when the API is unreachable instead of failing.

## Test coverage

Test coverage is a premise of the architecture, decided by Alisson on 2026-10-18: the platform is presented live at MAC USP and maintained by one person, so every repo measures its coverage and CI blocks a PR that drops it below the floor.

- **How:** Vitest with the V8 provider (`@vitest/coverage-v8`, free). `yarn test:coverage` prints the report (text, plus `coverage/index.html`); CI runs it instead of `yarn test`. The thresholds live in each repo's Vitest config.
- **Floors** (lines / statements / functions / branches):

  | Repo | Floor | Measured on 2026-10-18 |
  | --- | --- | --- |
  | `atlas-migracoes` | 95 / 95 / 90 / 85, and 95 / 95 / 95 / 90 for `src/lib` | 98.5 / 97.8 / 95.3 / 90.1 |
  | `atlas-migracoes-api` | 95 / 95 / 95 / 90 | 98.6 / 98.6 / 96.5 / 92.7 |
  | `atlas-migracoes-design-system` | 100 / 100 / 100 / 95 | 100 / 100 / 100 / 100 |

  A floor only goes up: when a PR raises coverage, it raises the floor too.
- **What is not measured, and why:** only code with no logic of its own. App: the Next.js route files in `src/app` (each `page.tsx` stays a thin wrapper delegating to a tested module), `src/i18n` and `src/proxy.ts` wiring, and barrels (`index.ts`); these are exercised by `next build`. API: entry points that only wire env, files and exit codes around tested functions (`src/index.ts`, `src/**/cli.ts`, `src/db/migrate.ts`, `api/graphql.ts`) and the declarative Drizzle tables (`src/db/schema.ts`, checked by the PGlite migrations in every test). DS: barrels. Logic never moves into these files to dodge the floor.
- **What the numbers do not prove:** behaviour in a real browser. That is the job of the Playwright suite in `e2e/` (see "Smoke and accessibility tests" below).

## Smoke and accessibility tests

`yarn test:e2e` (Playwright, Chromium, desktop and a Pixel 7 viewport) runs the built app (`yarn build` first) against `e2e/mock-api.mts`, a stand-in for the API that answers each GraphQL operation by name with simulated records (`meta.source = demo`; no collection data in the repo). The mock listens on the API's default local URL, `http://localhost:4000/graphql`, so the default build already points to it. CI runs it in a separate `e2e` job on every PR.

- `e2e/smoke.spec.ts` is the conference demo script: Explorar to an artist's record, the record to the IA Relacional and a citation to its finding, Camada Histórica, Rede Relacional, Sobre, the language switch keeping the page, and the skip link.
- `e2e/a11y.spec.ts` runs axe (`@axe-core/playwright`) on every screen in PT and EN and fails on any serious or critical WCAG 2.1 A/AA violation it can detect. What axe cannot judge (reading order, keyboard use of the map and the graph) is checked by hand before the deploy.
- Every page has a "Pular para o conteúdo" link as the first Tab stop, pointing to `#conteudo` (the wrapper in `modules/layout/Layout.tsx`).

## Visual direction

The dark Atlas screens in the project deck (`ap_MIGRACOES.pptx`, slides 12–21): night-blue surfaces, one gold accent, serif headings, small uppercase sans labels, translucent panels over the map, a reliability tag (documented, inferred, undetermined) next to claims. Single dark theme by design.

Brand (chosen by Alisson, 2026-10-20): the "Rosa Leste-Sul", a compass rose whose only gold stroke is the quarter turn from East to South. The header draws it with `shared/components/AtlasMark` (inline SVG coloured by the `foreground` and `accent` tokens) next to the live wordmark text; `src/app/icon.svg`, `favicon.ico` and `apple-icon.png` use the simplified icon (no ring, thicker strokes) on a night-blue square. The full kit (lockups, light and mono versions) lives outside the repo, in the project's files.

## Planned additions (see roadmap)

- Historical cartography: Europe's state borders from CShapes 2.0 (CC BY-NC-SA 4.0), one static file of polygons with validity dates built by `scripts/build-cartography.mts`; the app picks the polygons in force on a day and places birthplaces in them by point-in-polygon. See "Historical cartography" in the roadmap.
- Geocoding: a one-time Nominatim script plus manual review, stored in `places`; never a live lookup.
- Admin: Better Auth with the Drizzle adapter, sessions in Postgres, roles admin and researcher.
- E2E: when the admin area arrives, the login joins the smoke flow.
- IA Relacional: an API service that searches open sources (Wikidata, Wikipedia) and uses the Gemini API free tier to summarise; the key stays in the API's env. Every finding keeps its source URL and a reliability tag, the prompt is returned to the app, and the period's territories go into the prompt so the model reasons only with that period's geopolitics. Findings never enter the base without review.

## Design system consumption

The app installs `@alishenriques/atlas-design-system` from npm (`^0.3.0`; 0.1.0 first published 2026-10-17, 0.2.0 on 2026-10-18 with `SelectField` and `YearRange`, 0.3.0 the same day with `SegmentedControl`, `Legend` and the entity color tokens). New DS versions are released from the DS repo by bumping `version` and pushing a `v*` tag, which runs its publish workflow through npm Trusted Publishing; then bump the range here if the release is a new minor or major. To test unreleased DS changes, temporarily point the dependency at a commit (`github:alishenriques/atlas-migracoes-design-system#commit=…`; Yarn builds it through `prepack`) and never merge that pin.
