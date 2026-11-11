import type { Category } from '@/types'

/**
 * Sample categories (Project Plan section 3.1).
 *
 * This file becomes the first set of database records when the backend is
 * built, so it is written as if it were real.
 */
export const CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Infectious diseases',
    slug: 'infectious-diseases',
    description:
      'Illnesses caused by organisms such as bacteria, viruses and parasites. They pass between people, through food or water, or through the bites of insects. Many are preventable and treatable when they are found early.',
  },
  {
    id: 2,
    name: 'Chronic conditions',
    slug: 'chronic-conditions',
    description:
      'Long-term conditions that persist over months or years and are managed day to day. They are usually helped by healthy habits, regular check-ups and, when needed, long-term medicine.',
  },
  {
    id: 3,
    name: 'Respiratory conditions',
    slug: 'respiratory-conditions',
    description:
      'Conditions that affect the lungs and airways. They range from long-term conditions such as asthma to short-term infections of the chest, and they affect how well oxygen gets into the blood.',
  },
]
