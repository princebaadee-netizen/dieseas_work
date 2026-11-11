/**
 * The responsive and accessibility audit (Project Plan section 6, Milestone 7).
 *
 * Run with: npm run audit
 *
 * It builds the site, serves it, and drives a real Chrome through every
 * route at phone, tablet and desktop widths, plus rotation and 150% zoom.
 * At each size it runs axe-core over the page, checks that nothing spills
 * sideways, and collects anything the browser complains about. It also checks
 * the keyboard on the home page: the skip link, the focus ring and the search
 * suggestions.
 *
 * A page is only measured once it has shown the heading it is meant to show,
 * so a page that is still loading, or that is showing the wrong thing, is
 * reported rather than quietly passed.
 *
 * The audit uses the Chrome already installed on this machine, so nothing
 * has to be downloaded.
 */
import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, type Browser, type ConsoleMessage, type Page } from 'playwright-core'

const here = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(here, '..')
const port = 4189
const base = `http://127.0.0.1:${port}`

/** axe is injected into the page as a script, so its source is read as text. */
const axeSource = readFileSync(
  path.join(projectRoot, 'node_modules', 'axe-core', 'axe.min.js'),
  'utf8',
)

/** The browsers to drive. Playwright does not download a browser of its own. */
const BROWSERS: Array<{ label: string; path: string }> = [
  {
    label: 'Chrome',
    path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  },
  {
    label: 'Chrome',
    path: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  },
  {
    label: 'Edge',
    path: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  },
  {
    label: 'Edge',
    path: 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  },
]

/** The browsers that are on this machine, one entry per browser. */
function browsersOnThisMachine(): Array<{ label: string; path: string }> {
  const found: Array<{ label: string; path: string }> = []
  const labels = new Set<string>()
  for (const candidate of BROWSERS) {
    if (!existsSync(candidate.path)) continue
    if (labels.has(candidate.label)) continue
    labels.add(candidate.label)
    found.push(candidate)
  }
  return found
}

/**
 * The sizes to check.
 *
 * A phone, a phone turned sideways, a tablet, a tablet turned sideways, a
 * desktop, and the desktop at 150% zoom. Zoom is emulated by using the
 * smaller viewport it produces, which is what the reflow rule cares about.
 */
const VIEWPORTS = [
  { name: 'phone', width: 360, height: 740 },
  { name: 'phone landscape', width: 740, height: 360 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'tablet landscape', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'desktop 150% zoom', width: 960, height: 600 },
]

interface PublicRoute {
  path: string
  /** The heading the page must show once it has loaded. */
  heading: string
}

const PUBLIC_ROUTES: PublicRoute[] = [
  { path: '/', heading: 'Clear health information in one place' },
  { path: '/search?q=malaria', heading: 'Search results' },
  { path: '/search?q=xyzzy', heading: 'Search results' },
  { path: '/disease/malaria', heading: 'Malaria' },
  { path: '/disease/malaria/remedy', heading: 'Malaria' },
  { path: '/disease/typhoid-fever', heading: 'Typhoid fever' },
  { path: '/disease/typhoid-fever/remedy', heading: 'Typhoid fever' },
  { path: '/categories', heading: 'All categories' },
  { path: '/category/respiratory-conditions', heading: 'Respiratory conditions' },
  { path: '/about', heading: 'About and disclaimer' },
  { path: '/no-such-page', heading: 'Page not found' },
]

/**
 * One admin page, and the clicks that open it.
 *
 * The admin area is reached by clicking, the way an administrator would,
 * rather than by pushing an address into the history. Clicking keeps the
 * router's own bookkeeping correct, and it exercises the slide-out menu on
 * a phone, which is worth checking.
 */
interface AdminStep {
  /** The address the page should end up on. A `:name` part matches anything. */
  path: string
  /** The heading the page must show once it has loaded. */
  heading: string
  open: (page: Page) => Promise<void>
}

const ADMIN_STEPS: AdminStep[] = [
  {
    path: '/admin',
    heading: 'Dashboard',
    open: async () => {
      // The sign-in lands here.
    },
  },
  {
    path: '/admin/diseases',
    heading: 'Diseases',
    open: (page) => clickAdminNav(page, '/admin/diseases'),
  },
  {
    path: '/admin/diseases/new',
    heading: 'Add a disease',
    open: async (page) => {
      await clickAdminNav(page, '/admin/diseases')
      await page.getByRole('button', { name: 'Add disease' }).click()
    },
  },
  {
    path: '/admin/diseases/:id/edit',
    heading: 'Edit ',
    open: async (page) => {
      await clickAdminNav(page, '/admin/diseases')
      await page.locator('a[aria-label^="Edit "]').first().click()
    },
  },
  {
    path: '/admin/remedies',
    heading: 'Remedies',
    open: (page) => clickAdminNav(page, '/admin/remedies'),
  },
  {
    path: '/admin/remedies/new',
    heading: 'Write a remedy',
    open: async (page) => {
      await clickAdminNav(page, '/admin/remedies')
      await page.getByRole('button', { name: 'Write a remedy' }).click()
    },
  },
  {
    path: '/admin/remedies/:id/edit',
    heading: 'Edit the remedy for ',
    open: async (page) => {
      await clickAdminNav(page, '/admin/remedies')
      await page.locator('a[aria-label^="Edit the remedy for "]').first().click()
    },
  },
  {
    path: '/admin/categories',
    heading: 'Categories',
    open: (page) => clickAdminNav(page, '/admin/categories'),
  },
]

interface AxeCheckData {
  fgColor?: string
  bgColor?: string
  contrastRatio?: number
  expectedContrastRatio?: string
  fontSize?: string
  fontWeight?: string
}

interface AxeCheckResult {
  id?: string
  data?: AxeCheckData
}

interface AxeNode {
  target: string[]
  failureSummary?: string
  any?: AxeCheckResult[]
}

interface AxeViolation {
  id: string
  impact: string | null
  help: string
  nodes: AxeNode[]
}

interface Finding {
  route: string
  viewport: string
  kind: 'axe' | 'overflow' | 'console' | 'redirect'
  rule: string
  detail: string
}

const findings: Finding[] = []
let checks = 0
let pageLoads = 0
let failures = 0

function report(label: string, ok: boolean, detail = '') {
  checks += 1
  if (!ok) failures += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` -> ${detail}` : ''}`)
}

function waitForServer(): Promise<boolean> {
  return new Promise((resolve) => {
    let tries = 0
    const tick = async () => {
      tries += 1
      try {
        const response = await fetch(base, { signal: AbortSignal.timeout(2000) })
        if (response.ok) {
          resolve(true)
          return
        }
      } catch {
        // Not up yet.
      }
      if (tries > 60) {
        resolve(false)
        return
      }
      setTimeout(tick, 500)
    }
    void tick()
  })
}

/**
 * Opens the admin sidebar.
 *
 * On a phone the sidebar is a slide-out behind the menu button, so the
 * button is pressed first. On a wide screen the button is not there.
 */
async function openAdminMenu(page: Page) {
  const menu = page.getByRole('button', { name: 'Open admin menu' })
  if (await menu.isVisible()) {
    await menu.click()
    await page.waitForTimeout(300)
  }
}

/** Clicks a link in the admin sidebar, the way an administrator would. */
async function clickAdminNav(page: Page, href: string) {
  await openAdminMenu(page)
  await page.locator(`nav[aria-label="Admin"] a[href="${href}"]:visible`).first().click()
  await page.waitForTimeout(450)
}

/**
 * Signs in to the admin area.
 *
 * The placeholder session lives in the page's memory, so any full page load
 * clears it. The public routes are loaded fresh, so the sign-in has to be
 * done again before the admin routes can be reached.
 */
async function signIn(page: Page): Promise<boolean> {
  await page.goto(`${base}/admin/login`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(250)
  await page.fill('#email', 'admin@diseasewise.test')
  await page.fill('#password', 'diseasewise')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(600)
  return !page.url().includes('/admin/login')
}

async function runAxe(page: Page): Promise<AxeViolation[]> {
  await page.addScriptTag({ content: axeSource })
  const violations = await page.evaluate(async () => {
    const axe = (window as unknown as { axe: { run: () => Promise<{ violations: unknown[] }> } }).axe
    const result = await axe.run()
    return result.violations
  })
  return violations as AxeViolation[]
}

/**
 * The measurable part of an axe failure.
 *
 * For a contrast failure this gives the two colours and the ratio, so the
 * fix can be worked out without running the browser again.
 */
function describeCheck(node: AxeNode): string {
  const check = node.any?.find((entry) => entry.data?.contrastRatio !== undefined)?.data
  if (!check) return ''
  const parts = [`${check.fgColor} on ${check.bgColor}`]
  if (check.contrastRatio !== undefined) {
    parts.push(`ratio ${check.contrastRatio.toFixed(2)}`)
  }
  if (check.expectedContrastRatio) {
    parts.push(`needs ${check.expectedContrastRatio}`)
  }
  if (check.fontSize) parts.push(`at ${check.fontSize}`)
  return parts.join(', ')
}

/** Anything wider than the window means the page scrolls sideways. */
async function measureOverflow(page: Page): Promise<number> {
  return page.evaluate(() => {
    const root = document.documentElement
    return Math.max(root.scrollWidth, document.body.scrollWidth) - window.innerWidth
  })
}

/**
 * Waits for the page to show the heading it is meant to show.
 *
 * The pages fetch their data before they draw, so a fixed wait can catch a
 * page that is still on its way and measure the wrong thing. The heading is
 * the sign that the page has arrived, and it proves that the right page is
 * on screen and not only that the address changed.
 */
async function waitForHeading(page: Page, expected: string, timeout = 4000): Promise<string> {
  const deadline = Date.now() + timeout
  let heading = ''
  while (Date.now() < deadline) {
    heading = await page.evaluate(
      () => document.querySelector('h1')?.textContent?.trim() ?? '',
    )
    if (heading.startsWith(expected)) return heading
    await page.waitForTimeout(100)
  }
  return heading
}

/**
 * Does the address match the one that was expected?
 *
 * A `:name` part in the expected address matches any one part, so a page
 * that is opened by id can still be checked.
 */
function addressMatches(landed: string, expected: string): boolean {
  if (!expected.includes(':')) return landed === expected
  const pattern = new RegExp(`^${expected.replace(/:[^/]+/g, '[^/]+')}$`)
  return pattern.test(landed)
}

async function auditPage(
  page: Page,
  route: string,
  viewport: string,
  heading: string,
  open: () => Promise<void>,
) {
  await open()

  // The heading says the page has arrived and is the right page.
  const shown = await waitForHeading(page, heading)
  if (!shown.startsWith(heading)) {
    findings.push({
      route,
      viewport,
      kind: 'redirect',
      rule: 'wrong-page',
      detail: `the page showed "${shown || '(no heading)'}" instead of "${heading}"`,
    })
  }

  const violations = await runAxe(page)
  for (const violation of violations) {
    for (const node of violation.nodes) {
      findings.push({
        route,
        viewport,
        kind: 'axe',
        rule: violation.id,
        detail: [
          violation.help,
          `(${violation.impact ?? 'unknown'} impact)`,
          `at ${node.target.join(' ')}`,
          describeCheck(node),
        ].join(' '),
      })
    }
  }

  // A route that redirects somewhere else was not really audited, so the
  // redirect is reported rather than passing quietly.
  const expected = route.split('?')[0]
  const landed = new URL(page.url()).pathname
  if (!addressMatches(landed, expected)) {
    findings.push({
      route,
      viewport,
      kind: 'redirect',
      rule: 'wrong-page',
      detail: `the page opened ${landed} instead of ${expected}`,
    })
  }

  const overflow = await measureOverflow(page)
  if (overflow > 1) {
    findings.push({
      route,
      viewport,
      kind: 'overflow',
      rule: 'horizontal-scroll',
      detail: `the page is ${overflow}px wider than the window`,
    })
  }

  pageLoads += 1
}

async function collectConsole(page: Page, bucket: string[]) {
  page.on('console', (message: ConsoleMessage) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      bucket.push(`${message.type()}: ${message.text()}`)
    }
  })
}

/**
 * Keyboard checks (Project Plan Milestone 7, accessibility).
 *
 * These run on the home page: the skip link has to be the first thing the
 * keyboard reaches, it has to move focus into the content, the focus ring has
 * to be visible, and the search suggestions have to work without a mouse.
 */
async function keyboardChecks(page: Page) {
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(400)
  await page.evaluate(() => document.body.focus())

  await page.keyboard.press('Tab')
  const firstStop = await page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null
    return {
      text: element?.textContent?.trim() ?? '',
      hasRing: element
        ? getComputedStyle(element).outlineStyle !== 'none' ||
          getComputedStyle(element).boxShadow !== 'none'
        : false,
    }
  })
  report(
    'the first Tab reaches the skip link',
    firstStop.text.includes('Skip to main content'),
    `focus is on "${firstStop.text}"`,
  )
  report(
    'the focused element shows a visible outline',
    firstStop.hasRing,
    `outline and shadow checked on "${firstStop.text}"`,
  )

  await page.keyboard.press('Enter')
  await page.waitForTimeout(200)
  const afterSkip = await page.evaluate(() => document.activeElement?.id ?? '')
  report(
    'the skip link moves focus to the main content',
    afterSkip === 'main-content',
    `focus is on "${afterSkip}"`,
  )

  await page.focus('#disease-search')
  await page.keyboard.type('mal')
  // The suggestions wait for the typing to settle and then for the data, so
  // the list is waited for rather than guessed at.
  await page
    .waitForSelector('#search-suggestions li[role="option"]', { timeout: 5000 })
    .catch(() => undefined)
  const optionCount = await page.locator('#search-suggestions li[role="option"]').count()
  report('typing opens the suggestion list', optionCount > 0, `${optionCount} suggestions`)

  await page.keyboard.press('ArrowDown')
  const activeDescendant = await page.evaluate(
    () => document.activeElement?.getAttribute('aria-activedescendant') ?? '',
  )
  report(
    'the arrow keys move through the suggestions',
    activeDescendant !== '',
    `active descendant is "${activeDescendant}"`,
  )

  await page.keyboard.press('Enter')
  await page.waitForTimeout(500)
  const url = page.url()
  report(
    'Enter opens the highlighted suggestion',
    !url.includes('/search?q='),
    url.replace(base, ''),
  )
}

/** Runs the whole audit in one browser. */
async function auditInBrowser(executablePath: string, label: string) {
  let browser: Browser | undefined
  try {
    browser = await chromium.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    })

    const consoleMessages: string[] = []
    const context = await browser.newContext({ viewport: VIEWPORTS[0] })
    const page = await context.newPage()
    await collectConsole(page, consoleMessages)

    // Motion is switched off for the whole run. A colour sampled in the
    // middle of a fade is a colour nobody ever reads, so the audit would
    // report a contrast problem that is not really there.
    await context.addInitScript(() => {
      const style = document.createElement('style')
      style.textContent = `
        *, *::before, *::after {
          transition-duration: 0s !important;
          transition-delay: 0s !important;
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          scroll-behavior: auto !important;
        }
      `
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style))
      } else {
        document.head.appendChild(style)
      }
    })

    // Sign in once, to prove the sign-in works at all.
    report(`the audit can sign in to the admin area (${label})`, await signIn(page), page.url())

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      const where = `${label} ${viewport.name}`

      for (const route of PUBLIC_ROUTES) {
        await auditPage(page, route.path, where, route.heading, async () => {
          await page.goto(`${base}${route.path}`, { waitUntil: 'domcontentloaded' })
        })
      }

      // The public routes were loaded fresh, which cleared the placeholder
      // session, so the sign-in is repeated before the admin routes.
      const signedIn = await signIn(page)
      report(`the admin area is reachable (${where})`, signedIn, page.url())
      if (signedIn) {
        for (const step of ADMIN_STEPS) {
          await auditPage(page, step.path, where, step.heading, () => step.open(page))
        }
      }

      console.log(`  audited ${where} (${viewport.width}x${viewport.height})`)

      await keyboardChecks(page)
    }

    // The console should be clean. The browser is told to ignore favicon
    // requests for 404s, but everything else matters.
    const noise = consoleMessages.filter(
      (message) =>
        !message.includes('favicon') &&
        !message.includes('Download the React DevTools'),
    )
    for (const message of noise) {
      findings.push({
        route: '(console)',
        viewport: label,
        kind: 'console',
        rule: message.split(':')[0],
        detail: message.slice(0, 200),
      })
    }

    await context.close()
  } finally {
    await browser?.close()
  }
}

async function main() {
  if (!existsSync(path.join(projectRoot, 'dist', 'index.html'))) {
    console.log('The build is missing. Run "npm run build" first.')
    process.exit(1)
  }

  const browsers = browsersOnThisMachine()
  if (browsers.length === 0) {
    console.log('No Chrome or Edge found on this machine, so the audit cannot run.')
    process.exit(1)
  }

  const server = spawn(
    process.execPath,
    [
      path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js'),
      'preview',
      '--port',
      String(port),
      '--host',
      '127.0.0.1',
    ],
    { cwd: projectRoot, stdio: 'ignore' },
  )

  const up = await waitForServer()
  if (!up) {
    console.log('The preview server did not start.')
    server.kill()
    process.exit(1)
  }

  try {
    // The plan asks for the checklist to be run in at least two browsers, so
    // every browser on the machine is given the same run.
    for (const browser of browsers) {
      console.log(`\nAuditing with ${browser.label} (${browser.path})`)
      await auditInBrowser(browser.path, browser.label)
    }
  } finally {
    server.kill()
  }

  console.log('')
  if (findings.length === 0 && failures === 0) {
    console.log(
      `No problems found. ${pageLoads} page loads checked in ${browsers.length} browser(s).`,
    )
    process.exit(0)
  }

  if (failures > 0) {
    console.log(`${failures} check(s) failed.\n`)
  }

  const grouped = new Map<string, Finding[]>()
  for (const finding of findings) {
    const key = `${finding.kind}|${finding.rule}`
    const list = grouped.get(key) ?? []
    list.push(finding)
    grouped.set(key, list)
  }

  if (findings.length === 0) {
    console.log(`No page problems, but ${failures} check(s) failed above.`)
    process.exit(1)
  }

  console.log(`${findings.length} problem(s) found in ${pageLoads} page loads:\n`)
  for (const [key, list] of grouped) {
    const [kind, rule] = key.split('|')
    console.log(`--- ${kind}: ${rule} (${list.length})`)
    const routes = new Set(list.map((finding) => `${finding.route} @ ${finding.viewport}`))
    for (const route of Array.from(routes).slice(0, 5)) console.log(`    route: ${route}`)
    if (routes.size > 5) console.log(`    ...and ${routes.size - 5} more routes`)

    // Each distinct detail, with the first place it was seen, so a fix can
    // be found without repeating the run.
    const firstSeen = new Map<string, string>()
    for (const finding of list) {
      if (!firstSeen.has(finding.detail)) {
        firstSeen.set(finding.detail, `${finding.route} @ ${finding.viewport}`)
      }
    }
    const details = Array.from(firstSeen.entries())
    for (const [detail, where] of details.slice(0, 60)) {
      console.log(`    detail: ${detail} [${where}]`)
    }
    if (details.length > 60) console.log(`    ...and ${details.length - 60} more details`)
    console.log('')
  }

  process.exit(1)
}

main()
