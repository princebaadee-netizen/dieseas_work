# Frontend wishes list

What the frontend would like from the backend, in the order it would help
most. This is a wish list, not a demand: the plan's contract wins.

Each wish says what the frontend would do with it, so the backend team can
judge the cost.

## 1. One request per page

**Wish:** one endpoint loads a whole disease page, remedy included.

**Why:** the disease page, its remedy and the warning boxes are one
reading experience. Two or three requests for one page means the page can
be half-loaded, and the frontend has to handle a partial state that never
happens in the sample data.

**What the frontend already does:** `getDisease(slug)` returns the whole
record. The backend mirrors it.

## 2. Field errors, not one big message

**Wish:** when a save fails, the backend returns the same
`{ field: message }` map the frontend already shows.

**Why:** the admin form shows the message next to the field it belongs to.
A single "invalid input" message forces the form to show every field as
wrong, which is how people lose trust in a form.

**What the frontend already does:** `src/services/validation.ts` produces
the map, and the server should copy that file rather than write its own.

## 3. The same error wording

**Wish:** the backend sends the same messages the frontend sends.

**Why:** a message that appears in one place and not the other reads as two
different products. The frontend's messages are short, plain and free of
database details, which is also what the security rules ask for.

**Example:** "A disease with this name already exists" rather than
"Duplicate entry 'malaria' for key 'diseases.slug'".

## 4. Fast suggestions

**Wish:** the suggestions endpoint is fast enough to answer 200 milliseconds
after a keystroke.

**Why:** the search box asks for suggestions after every pause in typing.
A slow endpoint makes the box feel broken.

**What the frontend already does:** it waits 200 milliseconds, asks for
names and slugs only, and caps the list at six.

## 5. Keep the slugs still

**Wish:** a slug is made once, when the record is created, and never
changes.

**Why:** the slug is in the web address and in shared links. If it changes
when a disease is renamed, every link that was shared breaks.

**What the frontend already does:** the edit form shows the address as a
fixed preview, and the category rename form says the same.

## 6. Stable ordering

**Wish:** the same request with the same data returns the same order every
time.

**Why:** the admin list, the category list and the home page all rely on
an alphabetical order. If the database returns rows in a different order
each time, the lists shuffle for no reason.

**What the frontend already does:** it sorts alphabetically and the
featured list is sorted by name.

## 7. The right status codes

**Wish:** `400` for a validation failure, `401` for no session, `403` for a
session without permission, `404` for a missing record, `409` for a
duplicate, `500` for a server fault.

**Why:** the frontend can show the right message for each case instead of
guessing from the body.

**What the frontend already does:** it reads the body first, so it keeps
working if a status code is wrong, but it would rather have them right.

## 8. No surprise fields

**Wish:** the backend returns the fields in the structure and no others,
until the frontend asks for more.

**Why:** the frontend is built against the structure in
[data-structure.md](data-structure.md). A new field is harmless, but a
renamed or missing field is a break.

**What the frontend already does:** the tests in `tests/structure.test.ts`
check the sample data field by field against the structure.

## 9. A way to try it without the frontend

**Wish:** a saved request collection, so the endpoints can be tested on
their own.

**Why:** the plan asks for it in B2 and B5. It is how the backend team
checks the same cases the frontend checks, without running the frontend.

**What the frontend already does:** its test suite names every case, so it
can be read as the list of requests to try.

## 10. A friendly "not found"

**Wish:** a missing slug answers `404` with the same message shape as any
other failure.

**Why:** the public site has a friendly "we could not find that" page, and
the admin has a clear message. Both work best with a real `404`.

## What the frontend does not need

- **A second shape for the same data.** One shape, used everywhere.
- **A special "summary" endpoint.** The card data is already in the
  disease record.
- **Sorting or filtering on the server.** The lists are short enough to sort
  in the browser, and the frontend needs its own order for the home page.
