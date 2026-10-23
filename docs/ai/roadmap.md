# Roadmap

Deadline: **live on 8 November 2026** for the conference (10–12 Nov, MAC USP). Budget (revised 2026-10-17): **40 h** between 17 Oct and 8 Nov, R$ 2.800 (R$ 1.000 at the start, R$ 1.800 on 15 Nov). Hours per stage follow the client proposal ("Proposta … revisada").

## Definition of done of the MVP

The MVP is done when, at the final address, a visitor can:

- **Explorar**: see the 31 artists' trajectories on the map, filter by origin country and period, move along the 1918–1989 timeline and read the collection counters.
- **Trajetórias**: open an artist's record with trajectory, works, exhibitions, publications and sources with reliability tags.
- **Camada Histórica**: switch the map of Europe between decades (1910s–1980s) and see each artist's place of origin inside the territory that existed at the time.
- **Rede Relacional**: explore a graph linking artists, works, exhibitions, publications, institutions and places, filtered by period.
- **IA Relacional**: ask about an artist, event or work and get findings from external sources, each traced to its source, with reliability and the prompt shown; findings use only the geopolitics of the period researched.
- **Sobre**: read the project, methodology (Leitura, Relação, Confiabilidade) and cartography credits.

All of it responsive, at zero running cost, with no invented data.

## Stage 1: foundation and data (17–18 Oct, ~5 h): done

- [x] Repos created (public) with README and initial commit
- [x] Design system foundation: `--atlas-*` tokens from the deck, `Button`, `Eyebrow`, `Panel`, `ReliabilityTag`, `StatGrid`, CI and npm publish workflow
- [x] API foundation: Drizzle schema with `FuzzyDate`, idempotent xlsx importer with report, read-only GraphQL, demo mode, PGlite tests
- [x] App foundation: Next 16 + next-intl (pt/en, localized paths), layout, Explorar counters, placeholders, these docs, CI
- [x] DS 0.1.0 on npm (Trusted Publishing for later releases); app on `^0.1.0`
- [x] Neon database and Vercel projects, migrations, real import: 31 artists, 417 works, 299 exhibitions, 108 publications, 73 places
- [x] Places geocoded and reviewed (73/73); importer repairs glued US country names and applies reviewed place corrections

## Stage 2: map and records (19–27 Oct, ~12 h)

Done when you can pick an artist and follow their trajectory on the preview.

- [x] Explorar: MapLibre map, trajectory arcs, filters (origin country, period), 1918–1989 timeline, counters
- [x] Trajetórias: artist record, trajectory on the map, works, exhibitions, publications, sources with reliability tags
- [x] Sobre: project, methodology, cartography credits
- [x] Responsive layout of the three screens

## Stage 3: historical cartography and Rede Relacional (28 Oct – 2 Nov, ~12 h)

Done when the map switches decades and the graph opens from an artist's record.

- [x] Camada Histórica: Europe's state borders for any year 1910–1989 (decade and year), each birthplace read in the state of the artist's birth and of the year shown (see "Historical cartography" below)
- [x] Rede Relacional: graph of artists, works, exhibitions, publications, institutions and places from the base, period filter, opens from Trajetórias

## Stage 4: IA Relacional and delivery (3–8 Nov, ~11 h)

Done when the demo script runs end to end at the final address.

- [x] IA Relacional: search in open sources, findings traced to their source, results with reliability and the prompt shown, period-only geopolitics
  - [x] Open-source search in the API (Wikidata, Wikipedia), each finding with its source, reliability and review notes
  - [x] Screen in the app (`/ia-relacional`), opens from Trajetórias
  - [x] Summary with the Gemini API free tier, prompt shown, the period's territories in the prompt (API: `research.summary`, `research.period`; app: summary with citations, prompt and the period's map)
- [x] Accessibility pass, Playwright smoke flow, load optimization of the map and layers
  - [x] Playwright smoke flow and axe on every screen, in CI
  - [x] Accessibility fixes found by axe and by hand (language switch name, skip link)
  - [x] Load optimization of the map and layers: MapLibre already loads only on map screens; added a preconnect to the tile server, a preload of the borders file and a day of caching for it (see "Map loading" in architecture.md)
- [x] Vercel Web Analytics and Speed Insights in the app (requested by Alisson, 2026-10-20). Both are free on the Hobby plan within its monthly limits; turn them on in the Vercel project and add `@vercel/analytics` and `@vercel/speed-insights` to the root layout (`src/app/[locale]/layout.tsx`). No cookies or personal data, so no consent banner. Both turned on in the Vercel project by Alisson (2026-10-20).
- [x] Protect `main` in the three repos (requested by Alisson, 2026-10-20): merging only through a PR with green CI and Alisson's approval, no direct pushes, history kept linear (Rebase and merge). Note: GitHub does not let an author approve their own PR, and the PRs are opened under Alisson's account, so a required approving review would block every merge. Rule to use instead: a repository ruleset on `main` requiring a PR and the CI checks, blocking force pushes and deletions, with Alisson as the only bypass actor; his "Aproved" comment stays the approval, as in the PR workflow. Applied by Alisson in the three repos as the ruleset "restricted main" (2026-10-20).
- [x] State names of the period on the Camada Histórica and in the IA Relacional prompt (found in the review of production, 2026-10-22; added by Alisson). CShapes gives each state one name for its whole existence, so Vilnius in 1891 and Warsaw in 1913 show as "Russia (Soviet Union)" instead of the Russian Empire, and that name goes into the prompt: Lasar Segall's summary repeats it ("cidade então situada na Russia (Soviet Union)"). This breaks the AI guardrail (only the geopolitics of the period). Fix: a table of period names in pt and en, keyed by CShapes state and date range (Russian Empire until 1917, Soviet Russia until 1922, then the USSR; Austria-Hungary until 1918; and so on), used by `lib/cartography.ts` on the map and by `research.period` in the API, so the map labels also stop showing the source's English names. Never invent a name the sources do not support. Then regenerate the stored research of the artists whose period changes (`yarn research:generate --stale-period` in the API).
- [x] Loading skeletons on every screen that reads the API, above all the IA Relacional, which can take a while on an artist (atlas-migracoes#48, requested by Alisson, 2026-10-23): DS `Skeleton` (0.8.0), a `loading.tsx` per screen, and the IA Relacional findings streamed and swapped for their skeleton as soon as another artist is chosen (see "Loading states" in architecture.md)
- [x] Home page (atlas-migracoes#49, requested by Alisson, 2026-10-23): a slider like the home of his portfolio over a night world map with the arcs from Eastern Europe to Brazil, then why the project is needed and its impact on research and on the collection. Explorar moved from `/` to `/explorar` (see "Home page" in architecture.md)
- [ ] Team credits on Sobre: text to come from Alisson (never invent names or roles)
- [ ] Sobre text on the map, left for the end of the MVP with the team credits (decided by Alisson, 2026-10-22). The "Dados" section still says the map draws a single line from the birthplace to the first documented place in Brazil, with no intermediate routes; since atlas-migracoes#11 (2026-10-20) it draws each artist's whole trajectory in date order, with the leg from the birthplace to the first place in Brazil in gold. Update the pt and en texts and the "Data model" paragraph of architecture.md, which says the same.
- [ ] Security hardening (requested by Alisson, 2026-10-20; analysis of the three repos and their settings on the same day). All free. Code items go in PRs; settings items are Alisson's.
  - Before launch, code:
    - [x] API abuse limits: graphql-armor (max aliases, depth, tokens and cost, one `research` per operation), GraphiQL off in production. One alias-heavy query can fan `research` out over every artist and use up the Gemini free tier, and the cyclic types (Artist → Work → Exhibition → Work) allow huge nested responses.
    - [x] API: cache the read-only dataset per instance with a TTL, so a flood of requests does not drain the Neon free compute; persist or pre-generate the research results, so public traffic does not call Gemini live (the in-memory cache resets on every cold start and drops failed results). Done in atlas-migracoes-api#8 (limits and caches) and #16 (`research_results` table, `yarn research:generate`). Still to do on Alisson's machine: `yarn db:migrate`, `yarn research:generate`, and `GRANT SELECT ON research_results` to the read-only role.
    - [x] App: basic security headers in `next.config.ts` (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`/`frame-ancestors 'none'`, `Permissions-Policy`).
    - [x] All repos: `.github/dependabot.yml` (npm and github-actions, weekly) and `permissions: contents: read` in the CI workflows; DS: pin the npm version that `publish.yml` installs. Dependabot groups `vitest` with `@vitest/*` in the API, since the two must share a version (atlas-migracoes-api#17).
  - Before launch, Alisson's settings:
    - [ ] Google AI Studio: no billing account on the Gemini key's project (abuse then ends in a 429, never a charge), key restricted to the Generative Language API, and the key rotated, since it appeared in a screenshot.
    - [ ] Neon: a role with only `SELECT` for the API's `DATABASE_URL` on Vercel (marked Sensitive, Production only); the owner role stays on Alisson's machine for migrations and imports.
    - [ ] GitHub, in the three repos (Settings → Code security): Dependabot alerts and security updates, CodeQL default setup. Secret scanning and push protection are already on.
    - [ ] 2FA on every account that publishes or deploys (GitHub, npm, Vercel, Neon, Google); on npm, set the package to "Require 2FA and disallow tokens" (publishing is by OIDC).
    - [ ] Vercel: check Deployment Protection on previews and that the API's secrets are scoped to Production.
  - After the conference:
    - [ ] A tag ruleset on `v*` in the DS (a moved tag republishes to npm), actions pinned by SHA and limited to GitHub and verified creators, a full Content-Security-Policy (Report-Only first: MapLibre worker, OpenFreeMap, the API, Vercel Analytics), Private vulnerability reporting and a SECURITY.md, secret-scanning validity checks, auto-delete of head branches and only "Rebase and merge" enabled in each repo, a Vercel Firewall rate limit on `/graphql` if the Hobby plan offers it.
  - Already in place: the "restricted main" ruleset, secret scanning with push protection, read-only `GITHUB_TOKEN`, DS published by Trusted Publishing with provenance, API CORS allowlist without credentials, masked errors, Zod at every boundary, timeouts on outbound calls, no `dangerouslySetInnerHTML` in the app, https-only external links with `rel="noopener noreferrer"`, nothing secret or from the collection in git history.
- [ ] Launch check on 8 Nov: production already deploys from `main` on every merge (app https://atlas-migracoes.vercel.app, API https://atlas-migracoes-api.vercel.app/graphql, real base on Neon), so launch day means confirming the latest `main` is live in production, running the demo script end to end at that address (`yarn test:launch`, plus the hand checks of the map and graph), and fixing anything it finds

## Historical cartography

Goal: show Europe's borders and political divisions decade by decade, so that every artist and place of origin is read inside the territory that existed at the time, even when that country later ceased to exist, split or was renamed (Austria-Hungary, Russian Empire, Czechoslovakia, Yugoslavia, the USSR).

- **Source: CShapes 2.0** (ETH Zürich, CC BY-NC-SA 4.0; chosen by Alisson on 2026-10-18 over `historical-basemaps`, which placed 1914 Bessarabia in Romania and 1930 Kyiv in "White Russia"). CShapes gives one polygon per version of each state's border with the exact days it was valid, 1886–2019, so every year has exact borders and no map is approximate. It follows Gleditsch and Ward's list of states: states occupied or annexed in the Second World War (Poland, Austria) keep their borders, and a territory that was no state's on a day has no polygon. The screen says so.
- **One standardized file.** `scripts/build-cartography.mts` clips CShapes to Europe, simplifies it with mapshaper and keeps `name`, `start`, `end`, writing `public/cartography/europe-states.geojson` (~0.6 MB, served statically). The names shown are the period's, from `public/cartography/state-names.json` beside it (see its README). The raw download stays outside the repo (`~/atlas/cshapes/` on Alisson's machine). Never draw a border the source does not have. CShapes is credited in Sobre and on the screen.
- **Territories in the app.** The app filters the polygons in force on a day (1 July of the year shown) and finds the state containing each geocoded birthplace by point-in-polygon (`lib/cartography.ts`). An artist's origin is the state of the birthplace across the whole span the birth date can mean: when the date is a year and the border moved that year, both states are shown. The result is tagged "inferred". Storing territories in the API is deferred: the IA Relacional can read the same file.
- **AI guardrail.** The IA Relacional receives the period's territory names with every question and is instructed to reason only with the geopolitics of that period, never present-day borders. The prompt shown to the user includes this context, and findings that name a present-day country for a historical place are flagged for review.

## After the conference

- Admin area: login (Better Auth), artist list, create/edit, migration events, spreadsheet import with preview
- Researcher contribution flow, images of works, full English texts
- IA Relacional with more than one AI (requested by Alisson, 2026-10-21): a deeper search that asks several models, so every finding and every sentence of a summary records which AI supplied it (provider, model, date) as its reference. Today only Gemini writes the summary, and each stored research already keeps the model that answered and the prompt sent; the findings come from Wikidata and Wikipedia, each with its source page.
