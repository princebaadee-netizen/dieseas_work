# DiseaseWise

A public information site about diseases and remedies, plus a private admin
area where an administrator writes and edits that content.

**This repository holds the frontend only.** The backend does not exist yet.
Every piece of content lives in the sample data in `src/data` and changes are
lost when the page is reloaded.

## Running it

```bash
npm install
npm run dev        # the site on http://localhost:5173
```

## The scripts

| Script | What it does |
|---|---|
| `npm run dev` | The site on a local address |
| `npm run build` | Type check and build to `dist/` |
| `npm run preview` | Serves the built site |
| `npm run lint` | oxlint over the whole project |
| `npm run typecheck` | Type check on its own |
| `npm test` | The whole test suite: 179 tests in five files |
| `npm run test:watch` | The same tests, running as you work |
| `npm run test:coverage` | The same tests, with a coverage report |
| `npm run smoke` | Only the contract checks, the services area and the rules (80 tests) |
| `npm run check:admin` | Only the admin checks (19 tests) |
| `npm run audit` | Builds the site and drives it in a real browser: responsive layout, accessibility and the console (228 page loads) |
| `npm run sample-data` | Writes `docs/sample-data.json` again from the sample data |
| `npm run share-preview` | Builds the shareable preview picture |

`npm test` needs no browser. `npm run audit` needs a Chrome or Edge already
installed on the machine, and drives each one it finds through six screen
sizes.

## The tests

The suite is Vitest with Testing Library, in `tests/`. The tests open the
real routes through the real router, with the real services and the real
sample data, so a passing test means the app really behaves that way.

| File | Tests | What it covers |
|---|---|---|
| `tests/contract.test.ts` | 80 | The service contract: the search rules, the featured rule, the no-dosage rule and every admin action |
| `tests/admin.test.tsx` | 19 | The admin pages, the guard, the forms and the notices |
| `tests/public.test.tsx` | 18 | The public pages, from the home page to the not-found page |
| `tests/content.test.ts` | 15 | The content rules for the sample data |
| `tests/structure.test.ts` | 47 | The architecture rules and the handover package |

## The shape of the code

```
src/
  assets/       the logos
  components/
    admin/      the reusable admin pieces
    disease/    the pieces of the disease and remedy pages
    public/     the pieces of the public site
    search/     the search box, the filter and the result card
    shared/     the pieces used by both
  data/         the sample content and the in-memory store
  layouts/      the public frame and the admin frame
  pages/        the pages themselves
  routes/       the route list and the data loaders
  services/     every call to the data, and nothing else
  types/        the shared shapes, marked [LINK]
  utilities/    small helpers
tests/          the test suite
scripts/        the browser audit and the file generators
docs/           the handover package
```

Three rules hold the project together.

**Pages never read the data.** Everything goes through `src/services`. When
the backend arrives, only that folder changes.

**The types in `src/types` are the contract.** They are marked `[LINK]`. The
backend must return exactly these shapes. If the two disagree, the backend is
wrong.

**The validation lives in one place.** `src/services/validation.ts` holds
every rule. The frontend uses it while typing, and the server must repeat it
exactly.

## The documents

| Document | What it covers |
|---|---|
| `docs/handover.md` | The handover package for the backend team, with the index |
| `docs/project-notes.md` | The project, the decisions behind it and the design tokens |
| `docs/data-structure.md` | The exact fields every category, disease and remedy carries |
| `docs/backend-endpoints.md` | Every endpoint the backend has to provide, and the shape it returns |
| `docs/admin-security.md` | What the backend has to do about signing in, sessions and permissions |
| `docs/search-rules.md` | How a query is trimmed, matched and ranked |
| `docs/content-rules.md` | The wording rules the content must follow |
| `docs/version-2.md` | What was deliberately left out of this build |
| `docs/frontend-wishes.md` | What the frontend would like from the backend |
| `docs/sample-data.md` | The sample data, and how to load it |
| `docs/testing-checklist.md` | The Part 8 checklist, and what was checked how |
| `docs/fresh-eyes-test.md` | The script for testing with new users |

## The admin area

The sign-in uses `admin@diseasewise.test` with the password `diseasewise`.
That is a placeholder that lives in `src/services/config.ts` and it protects
nothing. The real rules are in `docs/admin-security.md`.

## What is still to do

The test suite passes and the responsive and accessibility audit passes in
both Chrome and Edge. It has not been tried with a screen reader or on a
real phone, the fresh-eyes session has not been run, and the site has no
backend yet. See the "Still to do" section of `docs/project-notes.md`.
