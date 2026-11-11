/**
 * Writes the sample data to `docs/sample-data.json`.
 *
 * The backend loads this file as the first records in the database, so it
 * has to be exactly what the frontend ships. Generating it from the source
 * keeps the two from drifting apart.
 *
 * Run with: npx tsx --tsconfig tsconfig.scripts.json scripts/makeSampleData.ts
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createStore } from '../src/data/store.ts'

const store = createStore()

const payload = {
  note: 'The sample data for DiseaseWise. Load these records first; the ids are the ones the frontend already uses.',
  categories: store.categories,
  diseases: store.diseases,
}

const target = join(process.cwd(), 'docs', 'sample-data.json')
writeFileSync(target, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

console.log(
  `Wrote ${payload.categories.length} categories and ${payload.diseases.length} diseases to docs/sample-data.json`,
)
