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
- [ ] Accessibility pass, Playwright smoke flow, load optimization of the map and layers
  - [x] Playwright smoke flow and axe on every screen, in CI
  - [x] Accessibility fixes found by axe and by hand (language switch name, skip link)
  - [ ] Load optimization of the map and layers
- [ ] Vercel Web Analytics and Speed Insights in the app (requested by Alisson, 2026-10-20). Both are free on the Hobby plan within its monthly limits; turn them on in the Vercel project and add `@vercel/analytics` and `@vercel/speed-insights` to the root layout. No cookies or personal data, so no consent banner.
- [ ] Protect `main` in the three repos (requested by Alisson, 2026-10-20): merging only through a PR with green CI and Alisson's approval, no direct pushes, history kept linear (Rebase and merge). Note: GitHub does not let an author approve their own PR, and the PRs are opened under Alisson's account, so a required approving review would block every merge. Rule to use instead: a repository ruleset on `main` requiring a PR and the CI checks, blocking force pushes and deletions, with Alisson as the only bypass actor; his "Aproved" comment stays the approval, as in the PR workflow. Applied by Alisson in each repo's Settings → Rules (Claude cannot change repository settings from here).
- [ ] Production deploy on 8 Nov

## Historical cartography

Goal: show Europe's borders and political divisions decade by decade, so that every artist and place of origin is read inside the territory that existed at the time, even when that country later ceased to exist, split or was renamed (Austria-Hungary, Russian Empire, Czechoslovakia, Yugoslavia, the USSR).

- **Source: CShapes 2.0** (ETH Zürich, CC BY-NC-SA 4.0; chosen by Alisson on 2026-10-18 over `historical-basemaps`, which placed 1914 Bessarabia in Romania and 1930 Kyiv in "White Russia"). CShapes gives one polygon per version of each state's border with the exact days it was valid, 1886–2019, so every year has exact borders and no map is approximate. It follows Gleditsch and Ward's list of states: states occupied or annexed in the Second World War (Poland, Austria) keep their borders, and a territory that was no state's on a day has no polygon. The screen says so.
- **One standardized file.** `scripts/build-cartography.mts` clips CShapes to Europe, simplifies it with mapshaper and keeps `name`, `start`, `end`, writing `public/cartography/europe-states.geojson` (~0.6 MB, served statically). The raw download stays outside the repo (`~/atlas/cshapes/` on Alisson's machine). Never draw a border the source does not have. CShapes is credited in Sobre and on the screen.
- **Territories in the app.** The app filters the polygons in force on a day (1 July of the year shown) and finds the state containing each geocoded birthplace by point-in-polygon (`lib/cartography.ts`). An artist's origin is the state of the birthplace across the whole span the birth date can mean: when the date is a year and the border moved that year, both states are shown. The result is tagged "inferred". Storing territories in the API is deferred: the IA Relacional can read the same file.
- **AI guardrail.** The IA Relacional receives the period's territory names with every question and is instructed to reason only with the geopolitics of that period, never present-day borders. The prompt shown to the user includes this context, and findings that name a present-day country for a historical place are flagged for review.

## After the conference

- Admin area: login (Better Auth), artist list, create/edit, migration events, spreadsheet import with preview
- Researcher contribution flow, images of works, full English texts
