# Handover package

This is the package the backend team receives when the frontend is finished
(Project Plan Milestone 8, `[LINK]`). Everything the backend has to agree
with lives in this folder, so nothing important is buried in a chat message
or in someone's head.

The rule behind all of it: **the frontend is built against the contract, so
the contract does not move.** If the backend cannot return something the
frontend asks for, the backend changes, not the structure.

## What is in the package

| Document | What it covers | Plan section |
|---|---|---|
| [Data structure](data-structure.md) | The exact fields every category, disease and remedy carries | 4.1 |
| [Function to endpoint list](backend-endpoints.md) | Every service function and the endpoint it becomes | 4.2, 4.4 |
| [Error format](backend-endpoints.md#how-failures-come-back) | The one shape every success and failure uses | 4.2 |
| [Search rules](search-rules.md) | How a query is trimmed, matched and ranked | 4.3 |
| [Admin security requirements](admin-security.md) | What the server must enforce | 5.6 |
| [Content rules](content-rules.md) | The wording rules the content must follow | 3.3 |
| [Version 2 list](version-2.md) | What was deliberately left out of this build | 9.4 |
| [Sample data](sample-data.md) and [sample-data.json](sample-data.json) | The five diseases, ready to load | 3.1 |
| [Frontend wishes list](frontend-wishes.md) | What the frontend would like from the backend | Milestone 8 |
| [Testing checklist](testing-checklist.md) | How the frontend was tested, and what is still manual | Part 8 |
| [Fresh-eyes test](fresh-eyes-test.md) | The script for testing with new users | Milestone 8 |

## The three rules the frontend follows

1. **All data goes through the services area.** No page, component or layout
   reads the data files. When the backend arrives, only `src/services`
   changes.
2. **The public site and the admin site are separate.** They share
   components, never layouts.
3. **The disclaimer is one shared string.** The wording is identical on every
   page, so it lives in one file.

## What the frontend already assumes

- One request loads a whole disease page, remedy included.
- A disease without a remedy carries `remedy: null`, never an empty object.
- Lists are always lists. An empty list is allowed; a missing list is not.
- Dates are ISO 8601 (`YYYY-MM-DD`).
- Slugs are lowercase, hyphen-separated and unique, and the server makes them.
- Deleting a category while diseases use it is refused, with a message that
  says how many diseases are in the way.

## How to check the handover

The frontend test suite checks the handover itself, so the package cannot go
out of date silently:

```bash
npm test
```

`tests/structure.test.ts` reads the source files and this folder, and fails
if a rule is broken or a document is missing.
