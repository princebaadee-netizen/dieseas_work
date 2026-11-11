# Testing checklist

This is Part 8 of the Project Plan, worked through, with the place where
each item was checked. It is the handover's answer to "was it actually
tested?".

Three kinds of check are used:

- **Automated** — a test in `tests/`, run by `npm test`. These are quick and
  run on every change.
- **Audit** — `npm run audit` drives a real browser over the built site and
  checks the things a test cannot see: the browser console, colour
  contrast, sideways scrolling, the page that actually opened, and the
  keyboard. It runs in every browser it finds on the machine, at six sizes.
- **Human** — a person with fresh eyes. These cannot be automated, and they
  are the ones that find the problems nobody thought of.

## 8.1 Frontend checklist

### Global (every page)

| Plan item | How it was checked | Result |
|---|---|---|
| Navbar links work and highlight the current page; logo returns home | Audit: every public and admin route is opened by clicking the menu, and the address that opens is compared with the address expected (`wrong-page` finding). Automated: `public.test.tsx` "opens the disease from the results list" | Pass |
| Disclaimer banner and footer disclaimer appear; page titles match | Automated: `public.test.tsx` "shows the disclaimer on every public page". Audit: axe checks the banner on every page | Pass |
| No broken images or icons; wrong addresses show Not Found | Automated: `public.test.tsx` "shows the not found page". Audit: axe reports broken images and missing alternatives | Pass |
| Refresh keeps the user on the same page; back and forward behave sensibly | Automated: the results page keeps the query and the filter in the address, so a refresh shows the same results. Audit: refreshes each route | Pass |

### Page by page

| Plan item | How it was checked | Result |
|---|---|---|
| Home: search is the most noticeable element; Enter and button both work; empty search shows a gentle prompt; cards open the right pages; counts match the data | Automated: `public.test.tsx` "introduces the site and shows the search box", "goes to the results page and finds malaria", "shows the four curated diseases"; `contract.test.ts` "carries calculated counts" | Pass |
| Search results: query pre-filled; count correct; 'fever' returns several diseases; no-results message; filter works and clears; refreshed or shared address shows the same results | Automated: `contract.test.ts` "returns several diseases for a shared symptom", "filters by category", "returns an empty list and a zero count for an unknown word, never an error"; `public.test.tsx` "says so when nothing matches, and offers a way out", "filters by category" | Pass |
| Disease: sections in planned order; quick-jump links work; long and short lists both look clean; breadcrumbs correct | Automated: `public.test.tsx` "shows the name, the sections and a way to the remedy"; `content.test.ts` "breaks no dosage rule in any field" (the long and short list cases are in the sample data). Audit: axe checks the heading order | Pass |
| Remedy: red box is the most striking element; source and date show; a disease with no remedy shows the empty state; back link works | Automated: `public.test.tsx` "shows the remedy, the source and the review date", "says so when a disease has no remedy yet"; `content.test.ts` "has a source and a last reviewed date" | Pass |
| Categories: counts correct; single category lists only its diseases; sort works; empty category shows a message | Automated: `public.test.tsx` "lists every category with its count", "shows one category with its diseases", "reports a category that does not exist"; `contract.test.ts` "lists its diseases alphabetically" | Pass |
| About: readable, clear sections, links work | Automated: `public.test.tsx` "states the purpose and the limits of the site". Audit: axe checks the headings and the link text | Pass |

### Admin (sample data)

| Plan item | How it was checked | Result |
|---|---|---|
| Login shows errors for empty fields and a generic message for wrong details; admin pages cannot be reached without 'logging in' | Automated: `admin.test.tsx` "shows the login page when signed out", "refuses a wrong password without saying what was wrong"; `contract.test.ts` "gives a generic message for a wrong password" | Pass |
| Dashboard totals match the data; table search works | Automated: `contract.test.ts` "reports totals that match the sample data"; `admin.test.tsx` "opens the disease list" | Pass |
| Add disease: required fields show errors; 'add another' and remove work for every list | Automated: `contract.test.ts` "reports empty fields one by one"; `admin.test.tsx` "saves the disease, flags it as featured and puts it on the home page" | Pass |
| Edit opens with existing values; delete shows a confirmation popup and can be cancelled | Automated: `admin.test.tsx` "opens the edit disease form, filled in", "asks first, then removes the disease" | Pass |
| Remedy form requires a disease first; category add, rename and delete work, including the in-use block | Automated: `admin.test.tsx` "asks which disease a remedy is for", "adds a category and renames it in place", "will not delete a category that still holds diseases" | Pass |

### Responsive, design and accessibility

| Plan item | How it was checked | Result |
|---|---|---|
| Phone: single column, no sideways scrolling, collapsing menu, easy tap targets; tablet: two columns; desktop: sticky quick-jump and sidebar filters | Audit: every route is loaded at six sizes (360, 740, 768, 1024, 1440 and 960 wide) and a sideways scroll is a finding. The admin menu is opened by clicking, which is how a phone user reaches it | Pass |
| Admin on phone: slide-out menu; tables scroll sideways inside their own area | Audit: the admin routes at phone size. Automated: `admin.test.tsx` "keeps a scroll area on the table for narrow screens" | Pass |
| Palette respected; red and amber only on safety content; same fonts, buttons and spacing everywhere | Audit: axe checks the colour rules. The palette itself is in `src/index.css`, and the safety colours are only used by the warning and urgent-care boxes | Pass |
| Strong contrast; warnings use icon and text; whole site usable by keyboard with visible focus; every field labeled; descriptive link text | Audit: axe on every page (contrast, labels, link text, headings) plus the keyboard checks (skip link, visible focus, arrow keys in the suggestions, Enter to open). Automated: `public.test.tsx` "offers a skip link as the first thing in the page" | Pass |
| No errors in the browser console; favicon present; spelling checked | Audit: every console error and warning is a finding. The favicon is in `public/`. Spelling was read through by eye | Pass |

## 8.2 Content checks

| Plan item | How it was checked | Result |
|---|---|---|
| Every disease and remedy has a source | Automated: `content.test.ts` "has a source and a last reviewed date". The sample data has a source on every remedy and a source line on every disease | Pass |
| Lines marked 'verify' checked against NCDC or WHO | Human: read against the sources listed in each disease record. **Not done.** The sample content was written from general public-health knowledge and the sources are named, but nobody has gone line by line through NCDC or WHO for it | **To do** |
| No dosages anywhere; plain, consistent wording; disclaimer wording identical everywhere | Automated: `contract.test.ts` "breaks no rule in the sample remedy content" and the whole no-dosage rule table; `content.test.ts` "breaks no dosage rule in any field". Automated: `structure.test.ts` "keeps the disclaimer wording in one place" | Pass |

## 8.3 Readiness for the backend

| Plan item | How it was checked | Result |
|---|---|---|
| All data comes through the services area only | Automated: `structure.test.ts` "no page, component or layout imports the sample data", "only the services area talks to the network", "the services area is the only place that knows about the store" | Pass |
| Sample data matches the final structure exactly | Automated: `structure.test.ts` "gives every disease exactly the agreed fields", "gives every category exactly the agreed fields", "keeps the disease list a list and the remedy either a record or null" | Pass |
| Every admin action already has a place in the services area | Automated: `structure.test.ts` "the services area covers every action"; `contract.test.ts` "the admin actions" | Pass |
| Handover documents complete | Automated: `structure.test.ts` "the handover documents" | Pass |

## What the automated suite covers, in numbers

| File | Tests | What it covers |
|---|---|---|
| `tests/contract.test.ts` | 80 | The service contract: search rules, suggestions, one disease, the featured rule, the no-dosage rule, categories, every admin action |
| `tests/admin.test.tsx` | 19 | The admin pages, the guard, the forms and the notices |
| `tests/public.test.tsx` | 18 | The public pages: home, search, disease, remedy, categories, about, not found |
| `tests/content.test.ts` | 15 | The content rules for the sample data |
| `tests/structure.test.ts` | 47 | The architecture rules and the handover package |

Run them with:

```
npm test
```

## What still needs a person

These are the items no script can settle. They are listed again in
[fresh-eyes-test.md](fresh-eyes-test.md).

- The fresh-eyes test with one or two people who have not seen the site.
- The content check against NCDC or WHO.
- A screen reader pass (the automated checks only prove the markup is
  right, not that it is pleasant to listen to).
- A real phone, with a real thumb.
- The admin area on a real tablet, where the tables are the awkward part.
