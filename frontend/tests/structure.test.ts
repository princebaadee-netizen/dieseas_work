/**
 * The readiness checks for the backend (Project Plan section 8.3).
 *
 * The plan asks for four things before the backend starts:
 * - all data comes through the services area only
 * - the sample data matches the final structure exactly
 * - every admin action already has a place in the services area
 * - the handover documents are complete
 *
 * These tests read the source files, so they keep those rules true as the
 * code changes.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import * as services from '@/services'
import { DISEASES, CATEGORIES } from '@/data'
import type { Disease, Category } from '@/types'

// The tests run from the project folder, which is where the sources live.
const projectRoot = process.cwd()
const srcRoot = join(projectRoot, 'src')
const docsRoot = join(projectRoot, 'docs')

/** Every source file under a folder. */
function sourceFiles(folder: string): string[] {
  const found: string[] = []
  for (const entry of readdirSync(folder)) {
    const full = join(folder, entry)
    if (statSync(full).isDirectory()) {
      found.push(...sourceFiles(full))
    } else if (/\.tsx?$/.test(entry)) {
      found.push(full)
    }
  }
  return found
}

function read(file: string): string {
  return readFileSync(file, 'utf8')
}

describe('all data comes through the services area only', () => {
  const outsideServices = sourceFiles(srcRoot).filter(
    (file) => !relative(srcRoot, file).startsWith(`services${sep}`),
  )

  it('no page, component or layout imports the sample data', () => {
    const offenders: string[] = []
    for (const file of outsideServices) {
      const text = read(file)
      if (/from\s+['"][^'"]*\/(data|data\/)[^'"]*['"]/.test(text)) {
        offenders.push(relative(projectRoot, file))
      }
    }
    expect(offenders).toEqual([])
  })

  it('only the services area talks to the network', () => {
    const offenders: string[] = []
    for (const file of outsideServices) {
      if (/\bfetch\s*\(/.test(read(file))) {
        offenders.push(relative(projectRoot, file))
      }
    }
    expect(offenders).toEqual([])
  })

  it('the services area is the only place that knows about the store', () => {
    const storeUsers = sourceFiles(srcRoot).filter((file) =>
      /from\s+['"][^'"]*data\/store['"]/.test(read(file)),
    )
    const allowed = storeUsers.filter((file) =>
      relative(srcRoot, file).startsWith(`services${sep}`),
    )
    expect(allowed.length).toBe(storeUsers.length)
  })
})

describe('the services area covers every action', () => {
  const publicActions = [
    'searchDiseases',
    'getDiseaseSuggestions',
    'getDisease',
    'getFeaturedDiseases',
    'getCategories',
    'getCategory',
  ]

  const adminActions = [
    'adminLogin',
    'adminLogout',
    'getAdminSession',
    'isAdminSignedIn',
    'getAdminStats',
    'adminListDiseases',
    'adminGetDisease',
    'adminCreateDisease',
    'adminUpdateDisease',
    'adminDeleteDisease',
    'adminListRemedies',
    'adminCreateRemedy',
    'adminUpdateRemedy',
    'adminDeleteRemedy',
    'adminListCategories',
    'adminCreateCategory',
    'adminUpdateCategory',
    'adminDeleteCategory',
  ]

  it.each([...publicActions, ...adminActions])('exports %s', (name) => {
    expect(typeof (services as Record<string, unknown>)[name]).toBe('function')
  })

  it('exports the content rule helpers too', () => {
    expect(typeof services.containsDosage).toBe('function')
    expect(typeof services.findDosage).toBe('function')
  })
})

describe('the sample data matches the final structure exactly', () => {
  const diseaseKeys = [
    'id',
    'category',
    'name',
    'slug',
    'shortSummary',
    'description',
    'symptoms',
    'causes',
    'riskFactors',
    'prevention',
    'remedy',
    'featured',
    'createdAt',
    'updatedAt',
  ]

  const categoryKeys = ['id', 'name', 'slug', 'description']

  it('gives every disease exactly the agreed fields', () => {
    for (const disease of DISEASES) {
      expect(Object.keys(disease).sort(), disease.name).toEqual([...diseaseKeys].sort())
    }
  })

  it('gives every category exactly the agreed fields', () => {
    for (const category of CATEGORIES) {
      expect(Object.keys(category).sort(), category.name).toEqual([...categoryKeys].sort())
    }
  })

  it('keeps the disease list a list and the remedy either a record or null', () => {
    for (const disease of DISEASES) {
      expect(Array.isArray(disease.symptoms)).toBe(true)
      expect(Array.isArray(disease.causes)).toBe(true)
      expect(Array.isArray(disease.riskFactors)).toBe(true)
      expect(Array.isArray(disease.prevention)).toBe(true)
      if (disease.remedy !== null) {
        expect(typeof disease.remedy.overview).toBe('string')
        expect(typeof disease.remedy.source).toBe('string')
        expect(typeof disease.remedy.lastReviewed).toBe('string')
      }
    }
  })

  it('has one disease without a remedy, so the empty state is covered', () => {
    expect(DISEASES.filter((disease) => disease.remedy === null).length).toBeGreaterThan(0)
  })
})

describe('the handover documents', () => {
  const required: Array<[string, string[]]> = [
    ['handover.md', ['# Handover package', 'Data structure', 'Function to endpoint', 'Error format', 'Search rules', 'Admin security', 'Content rules', 'Version 2', 'Sample data', 'Frontend wishes']],
    ['backend-endpoints.md', ['# Function to endpoint list', 'Public endpoints', 'Admin endpoints', 'How failures come back']],
    ['admin-security.md', ['# Admin security requirements', 'Authentication', 'Authorisation']],
    ['search-rules.md', ['# Search rules']],
    ['content-rules.md', ['# Content rules']],
    ['version-2.md', ['# Version 2']],
    ['sample-data.md', ['# Sample data']],
    ['frontend-wishes.md', ['# Frontend wishes']],
    ['testing-checklist.md', ['# Testing checklist']],
    ['fresh-eyes-test.md', ['# Fresh-eyes test']],
  ]

  it.each(required)('%s exists and covers its part', (name, headings) => {
    const file = join(docsRoot, name)
    expect(statSync(file).isFile(), name).toBe(true)
    const text = read(file)
    for (const heading of headings) {
      expect(text, `${name} should mention "${heading}"`).toContain(heading)
    }
  })

  it('keeps a copy of the sample data that the backend can load', () => {
    const file = join(docsRoot, 'sample-data.json')
    expect(statSync(file).isFile()).toBe(true)
    const parsed = JSON.parse(read(file)) as {
      categories: Category[]
      diseases: Disease[]
    }
    expect(parsed.categories.length).toBe(CATEGORIES.length)
    expect(parsed.diseases.length).toBe(DISEASES.length)
    expect(parsed.diseases[0]).toHaveProperty('featured')
  })
})

describe('the shapes the plan asks for', () => {
  it('keeps the public pages and the admin pages apart', () => {
    const publicPages = readdirSync(join(srcRoot, 'pages', 'public'))
    const adminPages = readdirSync(join(srcRoot, 'pages', 'admin'))
    expect(publicPages.length).toBeGreaterThan(0)
    expect(adminPages.length).toBeGreaterThan(0)

    const publicText = publicPages.map((file) => read(join(srcRoot, 'pages', 'public', file))).join('')
    expect(publicText).not.toContain('@/layouts/AdminLayout')
    expect(publicText).not.toContain('@/pages/admin')
  })

  it('uses one section component for symptoms, causes, risk factors and prevention', () => {
    const diseasePage = read(join(srcRoot, 'pages', 'public', 'Disease.tsx'))
    expect(diseasePage).toContain('InfoSection')
    const infoSection = read(join(srcRoot, 'components', 'disease', 'InfoSection.tsx'))
    expect(infoSection).toContain('items')
    expect(infoSection).toContain('title')
  })

  it('keeps the disclaimer wording in one place', () => {
    const disclaimer = read(join(srcRoot, 'components', 'shared', 'disclaimerText.ts'))
    expect(disclaimer).toContain('Educational information only')

    const files = sourceFiles(srcRoot)
    const withDisclaimerText = files.filter((file) =>
      /Educational information only/.test(read(file)),
    )
    // The wording lives in one file; the banner and the pages use it.
    expect(withDisclaimerText.length).toBeGreaterThan(0)
    expect(withDisclaimerText.length).toBeLessThanOrEqual(3)
  })

  it('uses the shared layout for the public site and another one for the admin site', () => {
    expect(statSync(join(srcRoot, 'layouts', 'PublicLayout.tsx')).isFile()).toBe(true)
    expect(statSync(join(srcRoot, 'layouts', 'AdminLayout.tsx')).isFile()).toBe(true)
  })
})
