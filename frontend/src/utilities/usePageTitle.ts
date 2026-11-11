import { useEffect } from 'react'

const SITE_NAME = 'DiseaseWise'
const DEFAULT_DESCRIPTION =
  'DiseaseWise - clear health information in one place. Search for a disease to read about its symptoms, causes, risk factors, prevention and treatment options.'

/** Finds a meta tag by name or property, adding it when it is missing. */
function metaTag(selector: 'name' | 'property', key: string): HTMLMetaElement {
  const existing = document.head.querySelector<HTMLMetaElement>(`meta[${selector}="${key}"]`)
  if (existing) return existing
  const created = document.createElement('meta')
  created.setAttribute(selector, key)
  document.head.appendChild(created)
  return created
}

/**
 * Sets the browser tab title for a page, and keeps the share tags in step.
 *
 * The title follows the pattern "Page - DiseaseWise" so every page is
 * distinguishable in the browser history and in search results.
 *
 * The Open Graph and Twitter tags are updated at the same time, so a shared
 * link shows the page it points at. Per-disease share images come from the
 * real data later (Project Plan Milestone 7).
 */
export function usePageTitle(title?: string, description?: string) {
  useEffect(() => {
    const fullTitle = title ? `${title} - ${SITE_NAME}` : `${SITE_NAME} - Clear health information in one place`
    const shareDescription = description ?? DEFAULT_DESCRIPTION

    document.title = fullTitle
    metaTag('property', 'og:title').content = fullTitle
    metaTag('property', 'og:description').content = shareDescription
    metaTag('property', 'og:url').content = window.location.href
    metaTag('name', 'twitter:title').content = fullTitle
    metaTag('name', 'twitter:description').content = shareDescription
    metaTag('name', 'twitter:url').content = window.location.href
  }, [title, description])
}
