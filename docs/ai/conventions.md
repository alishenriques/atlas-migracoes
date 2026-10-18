# Conventions

Same rules as the portfolio ecosystem, plus the data rules this project needs.

## Code

- TypeScript `strict`, no `any`. Prefer `unknown` plus Zod parsing at boundaries.
- Derive types from Zod schemas with `z.infer`; do not hand-write duplicates.
- Small, modular files; match the surrounding code's style and comment density.
- API imports use the `.js` extension (ESM); do not remove it.
- App: Tailwind class strings live in `styles/index.styles.ts` objects, not inline in JSX (short one-off layout classes in route files are fine). Use the token-backed colors (`bg-background`, `text-muted`, `text-accent`, `border-line`), never hex values.
- Every visible text goes through `next-intl` (`src/locales/*.json`), in both locales.

## Data

- Never invent or "clean up" a fact. Keep source spellings (historical place names, titles); add present-day names alongside (`currentName`).
- Dates are `FuzzyDate`; display them with their precision ("c. 1949", "1940–1945", "s.d.").
- Anything uncertain or provisional is labelled in the UI (reliability tag, provisional layer badge, demo notice).
- The real spreadsheets are never committed (`*.xlsx` is ignored in every repo). Tests use generated fixtures.

## Testing

- Vitest everywhere. Testing Library for React (`@testing-library/react` and `@testing-library/dom`).
- Test behavior, not implementation. Test GraphQL through `createApp(...).fetch(...)`.
- Async server components are tested by awaiting them (`render(await Home())`) with `next-intl/server` mocked.
- Watch out: a `beforeEach` that returns a function registers it as a cleanup hook; use a block body.
- Every change keeps its repo above its coverage floor (see "Test coverage" in [architecture.md](architecture.md)): new code comes with the tests that cover it, in the same PR. When coverage goes up, raise the floor in the same PR; never lower it, and never exclude a file or skip a test to get green.
- Code that needs a browser API jsdom lacks (MapLibre, WebGL) is tested by mocking that library at its boundary (`vi.mock("react-map-gl/maplibre", ...)`) and asserting what the component asks it to draw, as in `shared/components/TrajectoryMap/tests`.
- Before finishing: `yarn lint && yarn typecheck && yarn test:coverage` in every repo touched, plus `yarn build` here and in the DS.

## Design system

- A component that a different app could import as-is, with different props, goes in the DS; components tied to Atlas content or data stay in this app (`shared/components` or a module).
- Every DS component: `Name/Name.tsx`, `Name.module.css`, `Name.test.tsx`, `index.ts`, exported with its prop types from `src/index.ts`; uses `--atlas-*` tokens only; every visible text is a prop.
- Any change to public exports or visuals needs a version bump so the app can consume it.

## Git

- Default branch `main`; one feature branch per change.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).
- Small commits, one context each (Alisson's rule): split a change into commits by concern (for example schema, importer, API, docs) so each one can be read and reverted on its own. A PR can hold several commits; never pile unrelated changes into one.
- Never commit `.env*` (except `.env.example`), `dist/`, `node_modules/`, `*.xlsx`.

## Pull requests (Alisson's rule)

Every big change follows this flow in every repo:

1. **Branch** from up-to-date `main`.
2. **PR** detailed enough to evaluate without reading the code first: what changed and what it is about; the problem it solves; new or changed components/operations and how to use them; architecture decisions and discarded alternatives; how it was verified (lint/typecheck/test/build, screenshots or a preview URL for visual changes); cross-links to the matching PRs in the other repos.
3. **Review**: Alisson comments on the PR; reply on each thread and push fixes to the same branch, keeping the description current.
4. **Merge only after his explicit approval on the PR.** Never merge on your own, not even with green CI.
