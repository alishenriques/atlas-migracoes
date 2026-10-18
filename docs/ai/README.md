# AI agent instructions (index)

Instructions for AI agents (Claude Code, Cursor, etc.) working on the Atlas Migrações Leste-Sul ecosystem. Keep these files current: update them in the same change that alters what they describe.

- [architecture.md](architecture.md): the three repos, data flow, data model and decisions already made
- [conventions.md](conventions.md): code, data, testing, typing and git rules
- [roadmap.md](roadmap.md): what is done and what comes next, up to the MVP deadline

## What this is

A platform mapping artists from Eastern Europe and Austria who migrated to Brazil (contributions of immigrant art, 1918–1989), built from the MAC USP collection for the Migrações Leste-Sul research project. The MVP is presented at the project's conference at MAC USP on 10–12 November 2026 and **must be live on 8 November 2026**. Client: Tania Sulzbacher (the Academia de Curadoria is not involved). Owner and only admin at launch: Alisson.

## Scope of the MVP (revised by Alisson, 2026-10-17)

Budget: R$ 2.800 for 40 h (R$ 1.000 at the start, R$ 1.800 on 15 Nov 2026). The scope below is the MVP's definition of done; see [roadmap.md](roadmap.md).

- **In:** Explorar (map with trajectories, filters, 1918–1989 timeline, collection counters), Trajetórias (artist record, trajectory on the map, works, exhibitions, publications, sources), Camada Histórica (vector maps of Europe by decade with the borders of each period, linked to the artists' places of origin), **Rede Relacional** (graph connecting artists, works, exhibitions, publications, institutions and places), **IA Relacional** (connects the base to external information on artists, events and works: source search, tracing each finding to its source, results shown with sources, reliability and the prompt used; it reasons only with the geopolitics of the period researched), Sobre, and the full base imported from the three MAC USP spreadsheets.
- **Out (after the conference):** the admin area (login, create/edit; at launch the base is updated by the spreadsheet import), open contribution by researchers (the model already has room for roles and review status), full English texts (i18n structure is ready, texts are Portuguese first), images of works.

## Non-negotiables

1. **Zero cost.** Never add a paid service or a dependency requiring payment.
2. **Never invent data.** Unknown stays null, approximate dates keep their precision, provisional map layers are labelled provisional, and simulated demo data is always flagged (`meta.source = demo`).
3. **The real collection data never goes into a repository.** All three repos are public; the MAC USP spreadsheets stay on the machine that runs the import.
4. **Everything typed.** TypeScript `strict`; no `any`. Data crossing a boundary (API, env, forms, spreadsheets) is validated with a Zod schema.
5. **Everything tested, with measured coverage.** New logic ships with tests, and CI fails when coverage drops below each repo's floor (see "Test coverage" in [architecture.md](architecture.md)). Run `lint`, `typecheck` and `test:coverage` (and `build` here and in the DS) before finishing.
6. **Design system stays isolated.** Reusable UI lives in `atlas-migracoes-design-system` and is consumed as `@alishenriques/atlas-design-system`. Never import from its source path or copy components.
7. **Do not guess Next.js APIs.** This is Next 16; read `node_modules/next/dist/docs/` first (see `AGENTS.md`).
8. **Never commit secrets.** Only `.env.example` is tracked.
9. **Confirm before outward-facing actions** (publish to npm, deploy, creating accounts, databases or repos), unless already asked to.
10. **Big changes go through a reviewed PR, never straight to `main`.** New branch, a detailed PR (see "Pull requests" in [conventions.md](conventions.md)), and **no merge until Alisson explicitly approves it on the PR**.
