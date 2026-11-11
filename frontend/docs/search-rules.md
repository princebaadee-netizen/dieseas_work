# Search rules

The rules the backend must mirror exactly (Project Plan section 4.3). The
frontend implements them in `src/utilities/search.ts`, and the tests in
`tests/contract.test.ts` check each one.

## The rules

1. **Trim the text and ignore capital letters.** `  MALARIA  ` and `malaria`
   are the same query.
2. **Partial words match.** `mala` finds malaria.
3. **Search these fields:** disease name, short summary, symptoms, category
   name. The description is not searched; it is too long to match usefully.
4. **Rank in this order:**

   | Rank | Meaning | Example |
   |---|---|---|
   | 0 | The name matches | `malaria` finds Malaria |
   | 1 | A symptom matches | `fever` finds Typhoid fever |
   | 2 | The short summary matches | `chronic` finds Hypertension |
   | 3 | The category name matches | `respiratory` finds Asthma |
   | 4 | Every word appears somewhere across name, summary, category and symptoms | `malaria fever` |

5. **Ties are broken by name, A to Z.** Two diseases with the same rank
   appear in alphabetical order.
6. **Always return a total count.** No matches returns an empty list and a
   count of zero, never an error.
7. **An empty query returns everything**, in name order.
8. **A category filter narrows the list** before the ranking is applied, so
   a filter can never change the order of the results inside it.

## Suggestions

Suggestions are the lightweight version used by the search box
(Project Plan section 5.5):

- They need **two characters or more**. One character returns nothing.
- They match **disease names only**, not symptoms or summaries.
- They return **names and slugs only**, never a whole record.
- They are **capped at six** results.
- They are **not ranked**: they come back in name order.

The frontend waits 200 milliseconds after typing before asking for
suggestions, so the endpoint should be cheap and fast.

## Worked examples

These are the exact expectations in the test suite.

| Query | Result |
|---|---|
| `malaria` | 1 result: Malaria |
| `mala` | 1 result: Malaria |
| `fever` | 3 or more results, Typhoid fever first (name match) |
| `xyzzy` | 0 results, count 0, no error |
| `` (empty) | All 5 diseases, in name order |
| `  MALARIA  ` | 1 result: Malaria |
| empty with `category=chronic-conditions` | 2 results: Hypertension, Type 2 diabetes |

## What the backend should send back

The frontend expects the same `ServiceResult` shape as everything else:

```json
{ "success": true, "data": { "matches": [], "total": 0 }, "message": "" }
```

The search result carries `matches` (the ranked list) and `total` (the
count). The count is always present, even when it is zero.

## The one thing still open

The endpoint returns every match, with no page size. If the disease list
grows past roughly 30 to 50 records, the endpoint needs a limit and a page
number. The frontend already keeps the query and the filter in the web
address, so paging can be added without changing the pages.
