/**
 * The content rules for the sample data.
 *
 * The Project Plan asks for plain-language content with no dosages, no
 * prescription instructions and a source on every remedy
 * (Project Plan section 3.3). These tests read the sample data the way a
 * reader would receive it from the backend later, so the backend has to
 * bring data that passes the same rules.
 */
import { describe, expect, it } from 'vitest'
import { adminListDiseases, getCategories } from '@/services'
import { containsDosage, findDosage } from '@/services/validation'
import { DISEASES, CATEGORIES } from '@/data'
import { expectOk } from './helpers'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

describe('every disease', () => {
  it('has a name, a summary and a description', () => {
    for (const disease of DISEASES) {
      expect(disease.name.length, `${disease.name} name`).toBeGreaterThan(0)
      expect(disease.shortSummary.length, `${disease.name} summary`).toBeGreaterThan(0)
      expect(disease.description.length, `${disease.name} description`).toBeGreaterThan(0)
    }
  })

  it('has a slug that matches its name', () => {
    for (const disease of DISEASES) {
      expect(disease.slug, `${disease.name} slug`).toMatch(SLUG)
    }
  })

  it('has symptoms, causes, risk factors and prevention', () => {
    for (const disease of DISEASES) {
      expect(disease.symptoms.length, `${disease.name} symptoms`).toBeGreaterThan(0)
      expect(disease.causes.length, `${disease.name} causes`).toBeGreaterThan(0)
      expect(disease.riskFactors.length, `${disease.name} risk factors`).toBeGreaterThan(0)
      expect(disease.prevention.length, `${disease.name} prevention`).toBeGreaterThan(0)
    }
  })

  it('belongs to a category that exists', () => {
    const slugs = new Set(CATEGORIES.map((category) => category.slug))
    for (const disease of DISEASES) {
      expect(slugs.has(disease.category.slug), `${disease.name} category`).toBe(true)
    }
  })

  it('has dates in one format', () => {
    for (const disease of DISEASES) {
      expect(disease.createdAt, `${disease.name} createdAt`).toMatch(ISO_DATE)
      expect(disease.updatedAt, `${disease.name} updatedAt`).toMatch(ISO_DATE)
    }
  })

  it('breaks no dosage rule in any field', () => {
    const offenders: string[] = []

    for (const disease of DISEASES) {
      const fields: Array<[string, string]> = [
        ['shortSummary', disease.shortSummary],
        ['description', disease.description],
        ...disease.symptoms.map((text): [string, string] => ['symptom', text]),
        ...disease.causes.map((text): [string, string] => ['cause', text]),
        ...disease.riskFactors.map((text): [string, string] => ['risk factor', text]),
        ...disease.prevention.map((text): [string, string] => ['prevention', text]),
      ]

      for (const [field, text] of fields) {
        if (containsDosage(text)) {
          offenders.push(`${disease.name} (${field}): ${text}`)
        }
      }
    }

    expect(offenders).toEqual([])
  })

  it('has no leftover placeholder text', () => {
    const placeholders = /\b(todo|tbd|lorem ipsum|placeholder|xxx|fixme)\b/i
    const offenders: string[] = []

    for (const disease of DISEASES) {
      const text = [
        disease.name,
        disease.shortSummary,
        disease.description,
        ...disease.symptoms,
        ...disease.causes,
        ...disease.riskFactors,
        ...disease.prevention,
        ...(disease.remedy
          ? [
              disease.remedy.overview,
              disease.remedy.source,
              ...disease.remedy.careOptions,
              ...disease.remedy.precautions,
              ...disease.remedy.urgentSigns,
            ]
          : []),
      ].join(' ')

      if (placeholders.test(text)) offenders.push(disease.name)
    }

    expect(offenders).toEqual([])
  })
})

describe('every remedy', () => {
  it('has an overview, care options, precautions and warning signs', () => {
    for (const disease of DISEASES) {
      if (!disease.remedy) continue
      expect(disease.remedy.overview.length, `${disease.name} overview`).toBeGreaterThan(0)
      expect(disease.remedy.careOptions.length, `${disease.name} care options`).toBeGreaterThan(0)
      expect(disease.remedy.precautions.length, `${disease.name} precautions`).toBeGreaterThan(0)
      expect(disease.remedy.urgentSigns.length, `${disease.name} warning signs`).toBeGreaterThan(0)
    }
  })

  it('has a source and a last reviewed date', () => {
    for (const disease of DISEASES) {
      if (!disease.remedy) continue
      expect(disease.remedy.source.length, `${disease.name} source`).toBeGreaterThan(0)
      expect(disease.remedy.lastReviewed, `${disease.name} last reviewed`).toMatch(ISO_DATE)
    }
  })

  it('breaks no dosage rule', () => {
    const offenders: string[] = []

    for (const disease of DISEASES) {
      if (!disease.remedy) continue
      const text = [
        disease.remedy.overview,
        ...disease.remedy.careOptions,
        ...disease.remedy.precautions,
        ...disease.remedy.urgentSigns,
      ].join(' ')

      const match = findDosage(text)
      if (match) offenders.push(`${disease.name}: ${match.text} (${match.rule})`)
    }

    expect(offenders).toEqual([])
  })
})

describe('the sample set as a whole', () => {
  it('has no duplicate names or slugs', () => {
    const names = DISEASES.map((disease) => disease.name.toLowerCase())
    const slugs = DISEASES.map((disease) => disease.slug)
    expect(new Set(names).size).toBe(names.length)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('has no duplicate category names or slugs', () => {
    const names = CATEGORIES.map((category) => category.name.toLowerCase())
    const slugs = CATEGORIES.map((category) => category.slug)
    expect(new Set(names).size).toBe(names.length)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('flags at least one disease for the home page', () => {
    expect(DISEASES.filter((disease) => disease.featured).length).toBeGreaterThan(0)
  })

  it('shows the same diseases through the services as through the data', async () => {
    const listed = expectOk(await adminListDiseases())
    expect(listed.map((disease) => disease.slug).sort()).toEqual(
      DISEASES.map((disease) => disease.slug).sort(),
    )
  })

  it('counts the diseases in each category', async () => {
    const categories = expectOk(await getCategories())
    for (const category of categories) {
      const expected = DISEASES.filter(
        (disease) => disease.category.slug === category.slug,
      ).length
      expect(category.diseaseCount, category.slug).toBe(expected)
    }
  })
})
