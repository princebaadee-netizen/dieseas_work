# Data structure

The shape of every record the frontend expects (Project Plan section 4.1).

The source of truth is `src/types/disease.ts`, which is marked `[LINK]` in
its header comment. This document is the human-readable copy of it. The
TypeScript file wins if the two ever disagree.

## Category

```ts
interface Category {
  id: number
  name: string
  slug: string
  description: string
}
```

A category with its count, used by the categories page and the search
filter:

```ts
interface CategoryWithCount extends Category {
  diseaseCount: number
}
```

`diseaseCount` is always calculated from the data, never typed by hand.

## Disease

```ts
interface Disease {
  id: number
  category: { name: string; slug: string }
  name: string
  slug: string
  shortSummary: string
  description: string
  symptoms: string[]
  causes: string[]
  riskFactors: string[]
  prevention: string[]
  remedy: Remedy | null
  featured: boolean
  createdAt: string   // YYYY-MM-DD
  updatedAt: string   // YYYY-MM-DD
}
```

## Remedy

```ts
interface Remedy {
  id: number
  overview: string
  careOptions: string[]
  precautions: string[]
  urgentSigns: string[]
  source: string
  lastReviewed: string   // YYYY-MM-DD
}
```

## Service results

Every service function answers with the same shape, so the frontend never
guesses:

```ts
type ServiceResult<T> =
  | { success: true; data: T; message: string }
  | { success: false; message: string; fields?: Record<string, string> }
```

The full definition is in `src/types/service.ts`. The error format is
described in [backend-endpoints.md](backend-endpoints.md#how-failures-come-back).

## The one addition to the plan's table

The plan's table in section 4.1 does not list a `featured` field. The
frontend added one boolean, because section 9.3 left "featured" open and the
home page needs a flag rather than a date sort. The reason is written out in
[backend-endpoints.md](backend-endpoints.md#what-featured-means).

**The backend must return `featured` on every disease**, in list responses
and in detail responses, or the home page cannot pick its four.

## Rules the backend must mirror

1. Lists are always lists. An empty list is allowed; a missing list is not.
2. A disease without a remedy carries the explicit marker `remedy: null`.
3. Dates use one format: ISO 8601, `YYYY-MM-DD`.
4. Slugs are lowercase, hyphen-separated and unique.
5. Slugs are made by the server from the name, and stay fixed afterwards.
6. `updatedAt` changes on every edit.

## How the backend was verified against this

`tests/structure.test.ts` checks that the sample data has exactly these
fields, no more and no fewer, and `tests/content.test.ts` checks the
content rules on the same data. The sample data in
[sample-data.json](sample-data.json) is the same data, ready to load into
the first database tables.
