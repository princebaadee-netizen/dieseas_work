# Sample data

The five diseases and three categories the frontend ships with
(Project Plan section 3.1). They are the first records in the database when
the backend is built.

The machine-readable copy is [sample-data.json](sample-data.json). It is
generated from the source data by `npm run sample-data`, so the two can
never disagree.

## The three categories

| id | Name | Slug | Diseases |
|---|---|---|---|
| 1 | Infectious diseases | `infectious-diseases` | 2 |
| 2 | Respiratory conditions | `respiratory-conditions` | 1 |
| 3 | Chronic conditions | `chronic-conditions` | 2 |

## The five diseases

| id | Name | Slug | Category | Remedy | Featured |
|---|---|---|---|---|---|
| 1 | Malaria | `malaria` | Infectious diseases | Yes | Yes |
| 2 | Typhoid fever | `typhoid-fever` | Infectious diseases | No | Yes |
| 3 | Asthma | `asthma` | Respiratory conditions | Yes | Yes |
| 4 | Hypertension | `hypertension` | Chronic conditions | Yes | Yes |
| 5 | Type 2 diabetes | `type-2-diabetes` | Chronic conditions | Yes | No |

The table above matches the JSON. `npm run sample-data` rewrites the JSON,
and the tests in `tests/content.test.ts` check the same numbers.

## The edge cases on purpose

The plan asks for the awkward cases to be included (section 3.5), so the
empty states and the long lists are real rather than hypothetical.

| Case | Which record | What it tests |
|---|---|---|
| A disease with no remedy | Typhoid fever | The "being prepared" empty state on the remedy page, and the `remedy: null` marker |
| A very long symptoms list | Malaria and Type 2 diabetes | Long lists stay clean on the page and in the admin table |
| A short list | Asthma | A short list does not look broken |
| Two diseases sharing a symptom | Malaria and Typhoid fever both list fever | Search returns several results |
| A search that matches nothing | Any unknown word | The no-results state, with a count of zero and no error |
| A long name | Added by the admin tests | Names up to 120 characters, and the table's own scroll area |
| Accented characters | Added by the admin tests | `Fièvre jaune` saves and displays correctly |
| Symbols | Added by the admin tests | `Cost < 50% & > 1/2` saves and displays correctly |

## The featured flag

Four of the five diseases are flagged, so the home page shows a full
"Popular diseases" list. Type 2 diabetes is not flagged, which is how the
tests check that an unflagged disease stays off the home page.

If nothing is flagged at all, the rule falls back to the most recently
updated diseases, so a fresh install still shows a full home page. The
reason for choosing a flag over a date sort is in
[backend-endpoints.md](backend-endpoints.md#what-featured-means).

## The "verify" marks

The malaria record in the plan was a draft with lines marked `(verify)` to
be checked against NCDC guidance before publishing. The shipped content was
rewritten in plain language and those lines were resolved, but **a
qualified reviewer still has to sign off every record before it is used
with real readers**. See [content-rules.md](content-rules.md).

## Loading it into the backend

The records are in the order the frontend expects, with the ids the
frontend already uses, so the first database load keeps the same ids:

1. Create the `categories` table and load the three categories.
2. Create the `diseases` table and load the five diseases.
3. Create the list tables (`symptoms`, `causes`, `risk_factors`,
   `prevention`) and load each list, keeping the order as it is in the
   JSON.
4. Create the `remedies` tables and load the four remedies.

The JSON keeps the list order, so "display order" columns can be filled
straight from it.
