import type { FieldErrors } from '@/types'

/**
 * The validation rules, written once (Project Plan section 5.6 and risk 9.2).
 *
 * The frontend uses these while typing and before saving. The backend must
 * repeat every rule exactly, and returns failures in the same
 * `{ field: message }` shape.
 */

export interface DiseaseInput {
  name: string
  categorySlug: string
  shortSummary: string
  description: string
  symptoms: string[]
  causes: string[]
  riskFactors: string[]
  prevention: string[]
  /** Whether the disease is promoted to the home page list. */
  featured: boolean
}

export interface RemedyInput {
  overview: string
  careOptions: string[]
  precautions: string[]
  urgentSigns: string[]
  source: string
  lastReviewed: string
}

export interface CategoryInput {
  name: string
  description: string
}

const LIMITS = {
  name: 120,
  shortSummary: 300,
  description: 2000,
  listItem: 300,
  remedyText: 1500,
  source: 300,
  categoryName: 80,
  categoryDescription: 400,
} as const

/**
 * Content rule: no dosages and no prescription instructions
 * (Project Plan section 3.3). The remedy form shows a reminder and the
 * backend refuses to save text that breaks this rule.
 */
/**
 * Content rule: no dosages and no prescription instructions
 * (Project Plan section 3.3). The remedy form shows a reminder and the
 * backend refuses to save text that breaks this rule.
 *
 * The rule is a list of named patterns rather than one long expression, so
 * each rule can be read on its own, explained to the reviewer and tested on
 * its own. The backend must repeat the same list.
 *
 * What the rule catches: a number with a dose unit, a dosing frequency, an
 * interval in hours, a dose-change instruction, and the prescription
 * abbreviations clinicians write in capitals.
 *
 * What it deliberately leaves alone: durations ("rest for five days"),
 * percentages ("95% of cases") and vague schedules ("take it daily"). Those
 * are plain language rather than dosages, and blocking them would push the
 * reviewer towards worse wording. A reviewer still catches the vague cases.
 */

/** Units that turn a number into a dose. Longest forms come first. */
const DOSE_UNITS = [
  'milligrams?',
  'micrograms?',
  'millilitres?',
  'milliliters?',
  'grammes?',
  'grams?',
  'tablets?',
  'tabs?',
  'pills?',
  'capsules?',
  'caps?',
  'lozenges?',
  'sachets?',
  'ampoules?',
  'vials?',
  'suppositories?',
  'ointments?',
  'drops?',
  'puffs?',
  'units?',
  'doses?',
  'dosages?',
  'mcg',
  'mg',
  'ml',
  'iu',
  'g',
].join('|')

/** Counts written as digits or as words. */
const COUNT = String.raw`\d+(?:[.,]\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|half|quarter|a\s+couple\s+of|a\s+few`

/** Frequencies written as digits or as words. */
const TIMES = String.raw`once|twice|thrice|one\s+time|two\s+times|three\s+times|four\s+times|five\s+times|six\s+times|several\s+times|\d+\s+times`

/** A named rule that breaks the content rule when it matches. */
interface DosageRule {
  /** Shown to the administrator and used by the tests. */
  readonly name: string
  readonly pattern: RegExp
}

const DOSAGE_RULES: readonly DosageRule[] = [
  {
    name: 'a number with a dose unit',
    pattern: new RegExp(
      String.raw`\b(?:${COUNT})\s*(?:of\s+)?(?:a\s+|an\s+)?(?:${DOSE_UNITS})\b`,
      'i',
    ),
  },
  {
    name: 'a dosing frequency',
    pattern: new RegExp(
      String.raw`\b(?:${TIMES})\s+(?:(?:a|per|each|at)\s+)?(?:day|daily|night|nightly|morning|evening)\b`,
      'i',
    ),
  },
  {
    name: 'an interval in hours',
    pattern: /\bevery\s+\d+(?:\s*(?:to|-)\s*\d+)?\s*hours?\b/i,
  },
  {
    name: 'a dose change instruction',
    pattern:
      /\b(?:increase|decrease|reduce|raise|lower|double|halve|adjust|titrate)\s+(?:the\s+|your\s+)?(?:dose|dosage)\b/i,
  },
  {
    // Clinicians write these in capitals, so this rule stays case sensitive
    // and does not catch ordinary words.
    name: 'a prescription abbreviation',
    pattern: /\b(?:TDS|BD|OD|QID|PRN|HS|PO|IV|IM)\b/,
  },
]

/** The rule that a piece of text breaks, or `null` when it breaks none. */
export interface DosageMatch {
  /** Which rule matched. */
  rule: string
  /** The exact text that matched, so the administrator can find it. */
  text: string
}

/** Finds the first dosage rule that the text breaks. */
export function findDosage(text: string): DosageMatch | null {
  for (const rule of DOSAGE_RULES) {
    const match = rule.pattern.exec(text)
    if (match) return { rule: rule.name, text: match[0].trim() }
  }
  return null
}

/** True when the text breaks the no-dosage content rule. */
export function containsDosage(text: string): boolean {
  return findDosage(text) !== null
}

function clean(value: string): string {
  return value.trim()
}

function validateText(
  value: string,
  label: string,
  max: number,
  required = true,
): string | undefined {
  const text = clean(value)
  if (text === '') return required ? `${label} is required` : undefined
  if (text.length > max) return `${label} must be ${max} characters or fewer`
  return undefined
}

function validateList(
  values: string[],
  label: string,
  options: { required?: boolean; minItems?: number } = {},
): string | undefined {
  const { required = true, minItems = 1 } = options
  const items = values.map(clean).filter((item) => item !== '')
  if (items.length < minItems) {
    return required ? `Add at least ${minItems} ${label}` : undefined
  }
  const tooLong = items.find((item) => item.length > LIMITS.listItem)
  if (tooLong) return `Each ${label} must be ${LIMITS.listItem} characters or fewer`
  return undefined
}

/** Validates a disease before it is saved. An empty object means valid. */
export function validateDisease(input: DiseaseInput): FieldErrors {
  const errors: FieldErrors = {}

  const name = validateText(input.name, 'Name', LIMITS.name)
  if (name) errors.name = name

  if (clean(input.categorySlug) === '') {
    errors.categorySlug = 'Choose a category'
  }

  const summary = validateText(input.shortSummary, 'Short summary', LIMITS.shortSummary)
  if (summary) errors.shortSummary = summary

  const description = validateText(input.description, 'Description', LIMITS.description)
  if (description) errors.description = description

  const symptoms = validateList(input.symptoms, 'symptom')
  if (symptoms) errors.symptoms = symptoms

  const causes = validateList(input.causes, 'cause')
  if (causes) errors.causes = causes

  const riskFactors = validateList(input.riskFactors, 'risk factor')
  if (riskFactors) errors.riskFactors = riskFactors

  const prevention = validateList(input.prevention, 'prevention step')
  if (prevention) errors.prevention = prevention

  return errors
}

/** Validates a remedy before it is saved. */
export function validateRemedy(input: RemedyInput): FieldErrors {
  const errors: FieldErrors = {}

  const overview = validateText(input.overview, 'Overview', LIMITS.remedyText)
  if (overview) errors.overview = overview

  const careOptions = validateList(input.careOptions, 'care option')
  if (careOptions) errors.careOptions = careOptions

  const precautions = validateList(input.precautions, 'precaution')
  if (precautions) errors.precautions = precautions

  const urgentSigns = validateList(input.urgentSigns, 'urgent sign')
  if (urgentSigns) errors.urgentSigns = urgentSigns

  const source = validateText(input.source, 'Source or reviewer', LIMITS.source)
  if (source) errors.source = source

  const reviewed = clean(input.lastReviewed)
  if (reviewed === '') {
    errors.lastReviewed = 'A last reviewed date is required'
  } else if (Number.isNaN(new Date(reviewed).getTime())) {
    errors.lastReviewed = 'Use a valid date'
  } else if (new Date(reviewed).getTime() > Date.now()) {
    errors.lastReviewed = 'The reviewed date cannot be in the future'
  }

  const dosageFields = [
    ['overview', input.overview],
    ['careOptions', input.careOptions.join(' ')],
    ['precautions', input.precautions.join(' ')],
    ['urgentSigns', input.urgentSigns.join(' ')],
  ] as const

  for (const [field, text] of dosageFields) {
    const match = findDosage(text)
    if (match) {
      errors[field] = `Remove "${match.text}" (${match.rule}). Describe the treatment type and point to a health professional.`
      break
    }
  }

  return errors
}

/** Validates a category before it is saved. */
export function validateCategory(input: CategoryInput): FieldErrors {
  const errors: FieldErrors = {}

  const name = validateText(input.name, 'Name', LIMITS.categoryName)
  if (name) errors.name = name

  const description = validateText(input.description, 'Description', LIMITS.categoryDescription, false)
  if (description) errors.description = description

  return errors
}

/** True when there is nothing to report. */
export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0
}
