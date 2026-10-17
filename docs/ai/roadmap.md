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

- [ ] Explorar: MapLibre map, trajectory arcs, filters (origin country, period), 1918–1989 timeline, counters
- [ ] Trajetórias: artist record, trajectory on the map, works, exhibitions, publications, sources with reliability tags
- [ ] Sobre: project, methodology, cartography credits
- [ ] Responsive layout of the three screens

## Stage 3: historical cartography and Rede Relacional (28 Oct – 2 Nov, ~12 h)

Done when the map switches decades and the graph opens from an artist's record.

- [ ] Camada Histórica: one standardized vector map of Europe per decade, places linked to the territory of the period
- [ ] Rede Relacional: graph of artists, works, exhibitions, publications, institutions and places from the base, period filter, opens from Trajetórias

## Stage 4: IA Relacional and delivery (3–8 Nov, ~11 h)

Done when the demo script runs end to end at the final address.

- [ ] IA Relacional: search in open sources, findings traced to their source, results with reliability and the prompt shown, period-only geopolitics
- [ ] Accessibility pass, Playwright smoke flow, load optimization of the map and layers
- [ ] Production deploy on 8 Nov

## After the conference

- Admin area: login (Better Auth), artist list, create/edit, migration events, spreadsheet import with preview
- Researcher contribution flow, images of works, full English texts
