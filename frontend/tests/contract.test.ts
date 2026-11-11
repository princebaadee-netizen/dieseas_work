/**
 * The contract checks (Project Plan sections 4.2 and 4.3).
 *
 * These test the services area against the rules the backend has to mirror:
 * the search rules, the shape of the results, the no-dosage content rule,
 * the featured rule and the admin actions.
 *
 * Everything here goes through `@/services`, the same door the pages use.
 */
import { describe, expect, it } from 'vitest'
import {
  searchDiseases,
  getDiseaseSuggestions,
  getDisease,
  getFeaturedDiseases,
  getCategories,
  getCategory,
  adminLogin,
  adminLogout,
  isAdminSignedIn,
  getAdminStats,
  adminListDiseases,
  adminCreateDisease,
  adminUpdateDisease,
  adminDeleteDisease,
  adminCreateCategory,
  adminDeleteCategory,
  containsDosage,
  findDosage,
} from '@/services'
import { pickFeaturedDiseases } from '@/utilities/featured'
import type { Disease } from '@/types'
import type { DiseaseInput } from '@/services/validation'
import { expectFailed, expectOk } from './helpers'

/** Builds a form input from a saved disease, so the tests can edit it. */
function toInput(disease: Disease, featured = disease.featured): DiseaseInput {
  return {
    name: disease.name,
    categorySlug: disease.category.slug,
    shortSummary: disease.shortSummary,
    description: disease.description,
    symptoms: disease.symptoms,
    causes: disease.causes,
    riskFactors: disease.riskFactors,
    prevention: disease.prevention,
    featured,
  }
}

describe('search (section 4.3)', () => {
  it('finds malaria by name', async () => {
    const data = expectOk(await searchDiseases({ text: 'malaria' }))
    expect(data.matches[0]?.slug).toBe('malaria')
  })

  it('matches a partial word', async () => {
    const data = expectOk(await searchDiseases({ text: 'mala' }))
    expect(data.total).toBe(1)
  })

  it('returns several diseases for a shared symptom', async () => {
    const data = expectOk(await searchDiseases({ text: 'fever' }))
    expect(data.total).toBeGreaterThanOrEqual(3)
  })

  it('returns an empty list and a zero count for an unknown word, never an error', async () => {
    const data = expectOk(await searchDiseases({ text: 'xyzzy' }))
    expect(data.total).toBe(0)
    expect(data.matches).toHaveLength(0)
  })

  it('returns every disease for an empty query', async () => {
    const data = expectOk(await searchDiseases({ text: '' }))
    expect(data.total).toBe(5)
  })

  it('trims the query and ignores capital letters', async () => {
    const data = expectOk(await searchDiseases({ text: '  MALARIA  ' }))
    expect(data.total).toBe(1)
  })

  it('filters by category', async () => {
    const data = expectOk(
      await searchDiseases({ text: '', category: 'chronic-conditions' }),
    )
    expect(data.total).toBe(2)
  })

  it('ranks a name match above a summary match', async () => {
    const data = expectOk(await searchDiseases({ text: 'fever' }))
    expect(data.matches[0]?.slug).toBe('typhoid-fever')
  })
})

describe('suggestions', () => {
  it('needs two characters', async () => {
    const data = expectOk(await getDiseaseSuggestions('ma'))
    expect(data.length).toBeGreaterThan(0)
  })

  it('returns nothing for one character', async () => {
    const data = expectOk(await getDiseaseSuggestions('m'))
    expect(data).toHaveLength(0)
  })
})

describe('one disease', () => {
  it('loads with its remedy', async () => {
    const data = expectOk(await getDisease('malaria'))
    expect(data.remedy).not.toBeNull()
  })

  it('carries the explicit no-remedy marker when there is no remedy', async () => {
    const data = expectOk(await getDisease('typhoid-fever'))
    expect(data.remedy).toBeNull()
  })

  it('reports not found for an unknown slug', async () => {
    const failure = expectFailed(await getDisease('does-not-exist'))
    expect(failure.message.length).toBeGreaterThan(0)
  })
})

describe('the featured rule (section 9.3)', () => {
  it('returns a short list', async () => {
    const data = expectOk(await getFeaturedDiseases())
    expect(data).toHaveLength(4)
  })

  it('shows only the diseases an administrator flagged', async () => {
    const data = expectOk(await getFeaturedDiseases())
    expect(data.every((disease) => disease.featured)).toBe(true)
  })

  it('is in name order, not edit-date order', async () => {
    const data = expectOk(await getFeaturedDiseases())
    expect(data.map((disease) => disease.name).join('|')).toBe(
      'Asthma|Hypertension|Malaria|Typhoid fever',
    )
  })

  it('leaves a disease that is not flagged off the home page', async () => {
    const data = expectOk(await getFeaturedDiseases())
    expect(data.some((disease) => disease.slug === 'type-2-diabetes')).toBe(false)
  })

  it('falls back to the most recently updated when nothing is flagged', async () => {
    const sample = expectOk(await adminListDiseases())
    const noneFlagged = sample.map((disease) => ({ ...disease, featured: false }))
    expect(
      pickFeaturedDiseases(noneFlagged, 4)
        .map((disease) => disease.slug)
        .join('|'),
    ).toBe('malaria|asthma|hypertension|typhoid-fever')
  })

  it('uses the flagged list as soon as one disease is flagged', async () => {
    const sample = expectOk(await adminListDiseases())
    const oneFlagged = sample.map((disease) => ({
      ...disease,
      featured: disease.slug === 'malaria',
    }))
    expect(pickFeaturedDiseases(oneFlagged, 4)).toHaveLength(1)
  })

  it('never returns more than the limit', async () => {
    const sample = expectOk(await adminListDiseases())
    const noneFlagged = sample.map((disease) => ({ ...disease, featured: false }))
    expect(pickFeaturedDiseases(sample, 2)).toHaveLength(2)
    expect(pickFeaturedDiseases(noneFlagged, 99)).toHaveLength(5)
  })
})

describe('the no-dosage rule (section 3.3)', () => {
  const mustFlag = [
    'Take 500 mg of the medicine.',
    'Take two tablets before food.',
    'One capsule at night.',
    'Take 10ml of the syrup.',
    'Give the child half a tablet.',
    'Take one tablet three times daily.',
    'Use 2 puffs when needed.',
    'Take 5 drops under the tongue.',
    'Every 4 hours.',
    'Every 6 to 8 hours if needed.',
    'Increase the dose gradually.',
    'Reduce the dosage if symptoms get worse.',
    '1 tab BD.',
    '2 caps PO.',
    'Take 250 mcg each morning.',
    'Two sachets per day.',
    'Give 5 units of insulin.',
    'IV fluids are given in hospital.',
    'Take 1 g of the powder.',
    '10 IU daily.',
    'Take one tablet PRN.',
    'Take 3 tablets three times a day.',
    'One dose of the vaccine.',
  ]

  it.each(mustFlag)('catches "%s"', (text) => {
    expect(containsDosage(text)).toBe(true)
    expect(findDosage(text)?.rule).toBeTruthy()
  })

  const mustAllow = [
    'Rest, drink plenty of fluids and keep checking on the person.',
    'Speak to a health professional about the right treatment.',
    'Isolate at home and avoid close contact with others.',
    'Use a mosquito net at night to prevent bites.',
    'Wash your hands often and keep food covered.',
    'Vaccination is the main protection.',
    'Symptoms usually improve within a week.',
    'Take the medicine a health professional prescribes, following their instructions.',
    'The medicine is available in tablet form.',
    'A single dose may be needed.',
    'Rest for five days.',
    '95% of cases recover without treatment.',
    'Most people recover within two to three weeks.',
    'The dose is adjusted by a doctor.',
    'Some doses cause side effects.',
    'Drink eight glasses of water a day.',
    'Symptoms can last two or three weeks.',
    'The rash clears within a week.',
    'Take two or three of these daily.',
    'Finish the full course of treatment even after you feel better.',
  ]

  it.each(mustAllow)('allows "%s"', (text) => {
    expect(containsDosage(text)).toBe(false)
  })

  it('breaks no rule in the sample remedy content', async () => {
    const sample = expectOk(await adminListDiseases())
    const offenders: string[] = []
    for (const disease of sample) {
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

describe('categories', () => {
  it('carries calculated counts', async () => {
    const data = expectOk(await getCategories())
    expect(
      data.every((category) => typeof category.diseaseCount === 'number'),
    ).toBe(true)
  })

  it('lists its diseases alphabetically', async () => {
    const data = expectOk(await getCategory('infectious-diseases'))
    expect(data.diseases[0]?.name).toBe('Malaria')
    expect(data.diseases[1]?.name).toBe('Typhoid fever')
  })

  it('reports not found for an unknown category', async () => {
    expectFailed(await getCategory('nope'))
  })
})

describe('the admin actions', () => {
  it('starts signed out', () => {
    expect(isAdminSignedIn()).toBe(false)
  })

  it('gives a generic message for a wrong password', async () => {
    const failure = expectFailed(await adminLogin('admin@diseasewise.test', 'wrong'))
    expect(failure.message.toLowerCase()).not.toContain('password')
  })

  it('signs in with the placeholder details', async () => {
    expectOk(await adminLogin('admin@diseasewise.test', 'diseasewise'))
    expect(isAdminSignedIn()).toBe(true)
  })

  it('reports totals that match the sample data', async () => {
    const data = expectOk(await getAdminStats())
    expect(data.totalDiseases).toBe(5)
    expect(data.totalRemedies).toBe(4)
    expect(data.missingRemedies).toBe(1)
  })

  it('creates a disease', async () => {
    const created = expectOk(
      await adminCreateDisease({
        name: 'Test Disease',
        categorySlug: 'infectious-diseases',
        shortSummary: 'A short summary for the test.',
        description: 'A description for the test.',
        symptoms: ['One symptom'],
        causes: ['One cause'],
        riskFactors: ['One risk factor'],
        prevention: ['One prevention step'],
        featured: false,
      }),
    )
    expect(created.slug).toBe('test-disease')
  })

  it('rejects a duplicate name with a field error', async () => {
    const input: DiseaseInput = {
      name: 'Test Disease',
      categorySlug: 'infectious-diseases',
      shortSummary: 'A short summary for the test.',
      description: 'A description for the test.',
      symptoms: ['One symptom'],
      causes: ['One cause'],
      riskFactors: ['One risk factor'],
      prevention: ['One prevention step'],
      featured: false,
    }
    await adminCreateDisease(input)
    const duplicate = expectFailed(await adminCreateDisease(input))
    expect(duplicate.fields?.name).toBeDefined()
  })

  it('reports empty fields one by one', async () => {
    const failure = expectFailed(
      await adminCreateDisease({
        name: '',
        categorySlug: '',
        shortSummary: '',
        description: '',
        symptoms: [],
        causes: [],
        riskFactors: [],
        prevention: [],
        featured: false,
      }),
    )
    expect(Object.keys(failure.fields ?? {}).length).toBeGreaterThanOrEqual(7)
  })

  it('updates a disease', async () => {
    const created = expectOk(
      await adminCreateDisease({
        name: 'Test Disease',
        categorySlug: 'infectious-diseases',
        shortSummary: 'A short summary for the test.',
        description: 'A description for the test.',
        symptoms: ['One symptom'],
        causes: ['One cause'],
        riskFactors: ['One risk factor'],
        prevention: ['One prevention step'],
        featured: false,
      }),
    )
    const updated = expectOk(
      await adminUpdateDisease(created.id, {
        name: 'Test Disease Renamed',
        categorySlug: 'infectious-diseases',
        shortSummary: 'Updated summary.',
        description: 'Updated description.',
        symptoms: ['One symptom', 'Two symptoms'],
        causes: ['One cause'],
        riskFactors: ['One risk factor'],
        prevention: ['One prevention step'],
        featured: false,
      }),
    )
    expect(updated.name).toBe('Test Disease Renamed')
  })

  it('puts a flagged disease on the home page and takes it off again', async () => {
    const created = expectOk(
      await adminCreateDisease({
        name: 'Test Disease',
        categorySlug: 'infectious-diseases',
        shortSummary: 'A short summary for the test.',
        description: 'A description for the test.',
        symptoms: ['One symptom'],
        causes: ['One cause'],
        riskFactors: ['One risk factor'],
        prevention: ['One prevention step'],
        featured: false,
      }),
    )

    const flagged = expectOk(
      await adminUpdateDisease(created.id, { ...toInput(created), featured: true }),
    )
    const withFlag = expectOk(await getFeaturedDiseases(10))
    expect(flagged.featured).toBe(true)
    expect(withFlag.some((disease) => disease.id === created.id)).toBe(true)

    const unflagged = expectOk(
      await adminUpdateDisease(created.id, { ...toInput(created), featured: false }),
    )
    const withoutFlag = expectOk(await getFeaturedDiseases(10))
    expect(unflagged.featured).toBe(false)
    expect(withoutFlag.some((disease) => disease.id === created.id)).toBe(false)
  })

  it('deletes a disease', async () => {
    const created = expectOk(
      await adminCreateDisease({
        name: 'Test Disease',
        categorySlug: 'infectious-diseases',
        shortSummary: 'A short summary for the test.',
        description: 'A description for the test.',
        symptoms: ['One symptom'],
        causes: ['One cause'],
        riskFactors: ['One risk factor'],
        prevention: ['One prevention step'],
        featured: false,
      }),
    )
    expectOk(await adminDeleteDisease(created.id))
  })

  it('blocks the deletion of a category that is still in use', async () => {
    const failure = expectFailed(await adminDeleteCategory(1))
    expect(failure.message).toContain('2 diseases')
  })

  it('creates and deletes a category that is not in use', async () => {
    const created = expectOk(
      await adminCreateCategory({
        name: 'Skin conditions',
        description: 'Test category.',
      }),
    )
    expect(created.slug).toBe('skin-conditions')

    expectOk(await adminDeleteCategory(created.id))
  })

  it('clears the session on logout', async () => {
    await adminLogin('admin@diseasewise.test', 'diseasewise')
    await adminLogout()
    expect(isAdminSignedIn()).toBe(false)
  })
})
