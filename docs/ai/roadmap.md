# Roadmap

Deadline: **live on 8 November 2026** for the conference (10–12 Nov, MAC USP). Budget: 80 h over 20 days from 20 Oct, about 4 h a day. Full plan: the project's "Plano do MVP" document.

## Stage 1: foundation and data (20–25 Oct, ~24 h)

Done when the API answers with the 31 artists and their works, exhibitions and publications.

- [x] Repos created (public) with README and initial commit
- [x] Design system foundation: `--atlas-*` tokens from the deck, `Button`, `Eyebrow`, `Panel`, `ReliabilityTag`, `StatGrid`, CI and npm publish workflow (merged; StatGrid fix in DS PR #2)
- [x] API foundation: Drizzle schema with `FuzzyDate`, idempotent xlsx importer with report, read-only GraphQL, demo mode, PGlite tests (merged). Dry run on the real spreadsheets: 31 artists, 417 works, 299 exhibitions, 108 publications, 73 places; 11 exhibitions and 1 publication referenced by works are missing from the exports
- [x] App foundation: Next 16 + next-intl (pt/en, localized paths), layout with the MVP navigation, Explorar home with collection counters and demo notice, placeholders for the other screens, these docs, CI (PR open)
- [ ] First npm release of the DS (manual the first time, by Alisson), then switch the app from the GitHub pin to `^0.1.0`
- [ ] Neon database and Vercel projects (API and app), env vars, migrations, real import (needs Alisson's OK)
- [ ] Geocode the places: script in API PR #2 (Nominatim + review file); the run itself happens on Alisson's machine

## Stage 2: public screens (26 Oct – 1 Nov, ~28 h)

Done when you can pick an artist and follow their trajectory on the preview.

- [ ] Explorar: MapLibre map, trajectory arcs, filters (origin country, period), 1918–1989 timeline, counters
- [ ] Trajetórias: artist record, trajectory on the map, works, exhibitions, publications, sources with reliability tags, production by period
- [ ] Sobre: project, methodology (Leitura, Relação, Confiabilidade), cartography credits

## Stage 3: historical layer, admin and delivery (2–8 Nov, ~28 h)

Done when the demo script runs end to end at the final address.

- [ ] Camada Histórica: provisional historical layers by period, labelled as provisional (license of the borders dataset confirmed)
- [ ] Admin: login (Better Auth), artist list, create/edit, migration event, spreadsheet import with preview and report
- [ ] Responsiveness, accessibility pass, Playwright smoke flow, production deploy on 8 Nov

## After the conference

- Rede Relacional (a simple version may enter in the last week if time allows)
- IA Relacional with Gemini (free tier), showing the generated prompt and sources
- Researcher contribution flow, images of works, full English texts
