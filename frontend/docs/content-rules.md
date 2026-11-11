# Content rules

The wording rules for everything on the site (Project Plan section 3.3). The
backend must refuse text that breaks them, and the people writing the
content must follow them in the first place.

## The rules

1. **No dosages and no specific prescription instructions.** Name the kind of
   treatment and point the reader to a health professional.
2. **Plain language for an ordinary reader.** Short sentences, everyday
   words, no jargon without an explanation.
3. **Every remedy cites a source.** WHO, NCDC, CDC, NHS and Mayo Clinic are
   the recommended references. Write it in your own words; never copy text
   directly.
4. **A qualified person reads the content before it is relied on.** A
   pharmacist, nurse, doctor or lecturer.
5. **The disclaimer wording is identical everywhere.** It lives in one file,
   `src/components/shared/disclaimerText.ts`, and every page uses it.

## The no-dosage rule in detail

The frontend checks this with five named rules in
`src/services/validation.ts`. The backend must repeat the same five, and
should refuse to save the text with the same message.

| Rule | What it catches | Example |
|---|---|---|
| A number with a dose unit | a count next to a unit | `500 mg`, `two tablets`, `10ml`, `half a tablet`, `1 tab` |
| A dosing frequency | how often | `twice a day`, `three times daily`, `once at night` |
| An interval in hours | a gap between doses | `every 4 hours`, `every 6 to 8 hours` |
| A dose change instruction | a change to the amount | `increase the dose`, `reduce the dosage` |
| A prescription abbreviation | the clinical short forms | `TDS`, `BD`, `OD`, `QID`, `PRN`, `HS`, `PO`, `IV`, `IM` |

The abbreviation rule is case sensitive on purpose, so ordinary words are
never caught.

### What the rule deliberately leaves alone

- **Durations:** "rest for five days".
- **Percentages:** "95% of cases recover".
- **Vague schedules:** "take it daily".

Blocking these would push the reviewer towards worse wording, not better.
A human reviewer still catches the vague cases. This is a decision, not an
oversight, and the backend should copy it exactly.

## The remedy integrity rules

These come from Project Plan section 5.7:

- A remedy cannot be saved without a **source or reviewer** and a **last
  reviewed date**.
- There is **one remedy per disease**, enforced by the database.
- The admin remedy form shows a reminder not to include dosages.
- The dashboard shows the **review age**, so old content gets rechecked.
- A review date in the future is not allowed.

## The field limits

The backend must apply the same limits, and return the same messages.

| Field | Limit |
|---|---|
| Disease name | 120 characters |
| Short summary | 300 characters |
| Description | 2000 characters |
| Each list item (symptom, cause, risk factor, prevention) | 300 characters |
| Remedy overview, care option, precaution, warning sign | 1500 characters |
| Source or reviewer | 300 characters |
| Category name | 80 characters |
| Category description | 400 characters |

The rules live in one file, `src/services/validation.ts`, and are copied to
the server as they are, so the two cannot drift apart. This is the answer
to the risk in Project Plan section 9.2: "validation rules differ between
form and server".

## How the content is checked

`tests/content.test.ts` reads the sample data and fails if:

- a field is empty when it should not be,
- a list is empty when it should have items,
- a date is not in the ISO 8601 format,
- a slug does not match its name,
- a slug or a name appears twice,
- any field breaks one of the five dosage rules,
- placeholder text such as "TODO" or "lorem ipsum" is left in.

The same rules are checked on every remedy in the sample data, so the
backend can copy the tests as they are.

## The sample content and the "verify" marks

The malaria record in Project Plan section 3.4 was a draft, with lines
marked `(verify)` to be checked against NCDC guidance before publishing. The
sample data in this repository has been rewritten in plain language, and
the lines that needed checking are marked in
[sample-data.md](sample-data.md). **A qualified reviewer still has to sign
off the content before it is used with real readers.**
