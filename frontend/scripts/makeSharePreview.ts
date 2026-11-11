/**
 * Builds the share preview image (Project Plan Milestone 7, polish).
 *
 * Run with: npm run share-preview
 *
 * Social platforms need a real picture for a link preview, so this draws the
 * brand card in the installed Chrome and saves it as a PNG.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const here = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(here, '..')

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
]

const logo = readFileSync(path.join(projectRoot, 'src', 'assets', 'logo-full.svg'), 'utf8')

const topics = ['Symptoms', 'Causes', 'Risk factors', 'Prevention', 'Treatment options']

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 1200px;
        height: 630px;
        background: linear-gradient(135deg, #0F766E 0%, #115E59 100%);
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .card {
        width: 1000px;
        background: #FFFFFF;
        border-radius: 28px;
        padding: 64px 72px;
        box-shadow: 0 24px 60px rgba(4, 47, 46, 0.25);
      }
      .logo { width: 380px; height: auto; display: block; }
      h1 {
        margin-top: 34px;
        font-size: 46px;
        line-height: 1.15;
        color: #1E293B;
        font-weight: 700;
        letter-spacing: -0.5px;
      }
      p {
        margin-top: 18px;
        font-size: 26px;
        line-height: 1.45;
        color: #475569;
      }
      .topics { margin-top: 34px; display: flex; flex-wrap: wrap; gap: 12px; }
      .topics span {
        font-size: 21px;
        color: #115E59;
        background: #CCFBF1;
        border-radius: 999px;
        padding: 10px 22px;
      }
    </style>
  </head>
  <body>
    <div class="card">
      ${logo}
      <h1>Clear health information in one place</h1>
      <p>Search for a disease to read about its symptoms, causes, risk factors, prevention and treatment options.</p>
      <div class="topics">
        ${topics.map((topic) => `<span>${topic}</span>`).join('\n        ')}
      </div>
    </div>
  </body>
</html>`

async function main() {
  const chromePath = CHROME_PATHS.find((candidate) => existsSync(candidate))
  if (!chromePath) {
    console.log('No Chrome or Edge found on this machine, so the image cannot be built.')
    process.exit(1)
  }

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })

  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
    await page.setContent(html, { waitUntil: 'load' })
    const target = path.join(projectRoot, 'public', 'share-preview.png')
    await page.screenshot({ path: target })
    console.log(`Wrote ${path.relative(projectRoot, target)}`)
  } finally {
    await browser.close()
  }
}

main()
