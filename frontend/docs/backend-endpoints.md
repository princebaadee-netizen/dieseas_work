# Function to endpoint list

Every function in `src/services` is the placeholder for one backend call.
This table is the handover list: when the backend is built, each row is one
endpoint, and the service function changes from "read the sample data" to
"call the API".

The base URL comes from `SETTINGS.apiBaseUrl` in `src/services/config.ts`,
which reads `VITE_API_BASE_URL` and falls back to `http://localhost:5000/api`.

## Public endpoints

No session needed. These are the ones the public site calls.

| Service function | Method and path | Returns | Notes |
|---|---|---|---|
| `searchDiseases(params)` | `GET /diseases/search?q=&category=` | `SearchResult` | `matches` and `total`. Ranking follows section 4.3. An empty `q` returns everything. |
| `getDiseaseSuggestions(text)` | `GET /diseases/suggestions?q=` | `Disease[]` | Names only, for the search box. |
| `getDisease(slug)` | `GET /diseases/:slug` | `Disease` | The whole record, remedy included or `null`. |
| `getFeaturedDiseases()` | `GET /diseases/featured` | `Disease[]` | The diseases an administrator flagged, in name order, capped at four. See "Decisions made" below. |
| `getCategories()` | `GET /categories` | `CategoryWithCount[]` | Each category carries `diseaseCount`. |
| `getCategory(slug)` | `GET /categories/:slug` | `CategoryWithDiseases` | The category and its diseases, alphabetical by name. |

## Admin endpoints

These need a valid session. A signed-out request answers `401`, a signed-in
request without permission answers `403`.

| Service function | Method and path | Returns | Notes |
|---|---|---|---|
| `adminLogin(email, password)` | `POST /admin/login` | `AdminSession` | The generic failure message in `docs/admin-security.md` section 1.2. |
| `adminLogout()` | `POST /admin/logout` | `null` | Invalidates the server session. |
| `getAdminSession()` | `GET /admin/session` | `AdminSession \| null` | Lets the frontend know if a session is still alive after a page reload. |
| `getAdminStats()` | `GET /admin/stats` | `AdminStats` | Totals plus the five most recently updated diseases. |
| `adminListDiseases()` | `GET /admin/diseases` | `Disease[]` | Alphabetical by name. |
| `adminGetDisease(id)` | `GET /admin/diseases/:id` | `Disease` | By id, not by slug. |
| `adminCreateDisease(input)` | `POST /admin/diseases` | `Disease` | The server generates the id, the slug and the dates. |
| `adminUpdateDisease(id, input)` | `PUT /admin/diseases/:id` | `Disease` | The whole record is replaced. |
| `adminDeleteDisease(id)` | `DELETE /admin/diseases/:id` | `null` | Also removes the remedy. |
| `adminListRemedies()` | `GET /admin/remedies` | `Disease[]` | Every disease, so the list can show which ones are missing a remedy. |
| `adminCreateRemedy(diseaseId, input)` | `POST /admin/diseases/:id/remedy` | `Disease` | One remedy per disease. |
| `adminUpdateRemedy(diseaseId, input)` | `PUT /admin/diseases/:id/remedy` | `Disease` | |
| `adminDeleteRemedy(diseaseId)` | `DELETE /admin/diseases/:id/remedy` | `Disease` | The disease stays; the remedy goes. |
| `adminListCategories()` | `GET /admin/categories` | `Category[]` | |
| `adminCreateCategory(input)` | `POST /admin/categories` | `Category` | |
| `adminUpdateCategory(id, input)` | `PUT /admin/categories/:id` | `Category` | The slug stays fixed after creation. |
| `adminDeleteCategory(id)` | `DELETE /admin/categories/:id` | `Category` | Refused while diseases still use it. |

## How failures come back

Every endpoint answers with the same shape, so the frontend never has to
guess. This is `ServiceResult<T>` in `src/types/service.ts`.

Success:

```json
{ "success": true, "data": { }, "message": "Saved Malaria." }
```

Failure:

```json
{
  "success": false,
  "message": "Please fix the highlighted fields.",
  "fields": { "name": "A disease with this name already exists" }
}
```

`fields` is only present when a form failed validation. The keys are the
form field names used by `src/services/validation.ts`.

A failure that is not a validation problem has no `fields`, for example
`"That disease could not be found."`

## Validation that moves to the server

`src/services/validation.ts` stays in the frontend for speed and for showing
the administrator what to fix. The server must repeat all of it. The rules,
with their limits, are listed in `docs/admin-security.md` section 3.

## What changes when the backend arrives

1. `src/services/transport.ts` swaps the sample-data calls for `fetch`.
2. `SETTINGS.useMockData` becomes `false`, and the mock branch is removed.
3. The `withMock` helper loses its delay and calls the API instead.
4. `src/services/validation.ts` stays exactly as it is, and is copied to the
   server so the two cannot drift apart.
5. `src/types/disease.ts` and `src/types/service.ts` stay exactly as they
   are. They are the contract. If the server and the frontend disagree,
   the server is wrong. The one addition to the plan's table is the
   `featured` flag described above.

No page, component or layout changes. That is the point of the services
folder.

## Decisions made

Two questions the Project Plan left open have been answered by the frontend.
Both are recorded here because the backend has to agree with them.

### What "featured" means

The plan's section 9.3 offers two answers: "a flag or most recently updated".
We chose **the flag**.

The reason is the home page. Its section is headed "Popular diseases", and a
list ordered by edit date is not a popular list: an administrator correcting a
typo would move that condition to the front of the site, and the list would
shuffle on every unrelated edit. With a flag, an administrator decides what
deserves the space, which also lets the site respond to a health alert or a
seasonal risk.

**This changes the contract.** The plan's data structure in section 4.1 does
not list a featured field, so the disease record needs one extra column:

| Field | Type | Notes |
|---|---|---|
| `featured` | boolean | `false` by default. The backend must return it on every disease, in list and detail responses. |

The rule itself, in `src/utilities/featured.ts`:

1. The diseases with `featured: true`, sorted by name, capped at four.
2. If nothing is flagged, the most recently updated diseases instead, so a
   fresh install still shows a full home page.

The backend should apply the same rule in `GET /diseases/featured`, so the
home page does not have to download every disease to pick four.

The plan uses two names for this list: "popular diseases" in the home page
copy and "featured" in the service and endpoint names. They are the same
list, and both names are kept in the frontend.

### The no-dosage content rule

The plan's section 3.3 says "no dosages or specific prescription instructions".
The frontend checks this with five named rules, in
`src/services/validation.ts`. The backend must repeat the same five.

| Rule | Matches |
|---|---|
| A number with a dose unit | `500 mg`, `two tablets`, `10ml`, `half a tablet`, `1 tab` |
| A dosing frequency | `twice a day`, `three times daily`, `once at night` |
| An interval in hours | `every 4 hours`, `every 6 to 8 hours` |
| A dose change instruction | `increase the dose`, `reduce the dosage` |
| A prescription abbreviation | `TDS`, `BD`, `OD`, `QID`, `PRN`, `HS`, `PO`, `IV`, `IM` |

Three things are deliberately left alone, because blocking them would push
the reviewer towards worse wording: durations ("rest for five days"),
percentages ("95% of cases") and vague schedules ("take it daily"). A human
reviewer still catches those.

`tests/contract.test.ts` has a test for each rule, and a test that every
remedy in the sample content passes.

## Open decisions

- **Where the no-remedy marker lives.** The frontend uses `remedy: null`.
  The server must send `null` as well, never an empty object and never
  `""`.
- **The list length.** The search endpoint returns every match. If the
  disease list grows, the endpoint needs a limit and a page number, and the
  frontend needs to handle both.
