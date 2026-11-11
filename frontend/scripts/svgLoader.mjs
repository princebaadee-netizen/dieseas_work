/**
 * A small Node loader so the check can import the app's SVG files.
 *
 * Vite turns an SVG import into a URL. Node has no idea what to do with one,
 * so this loader returns the file's text as the default export. The images
 * are never drawn in the check, they only need to import cleanly.
 */
import { readFile } from 'node:fs/promises'

export async function load(url, context, nextLoad) {
  if (url.endsWith('.svg')) {
    const source = await readFile(new URL(url), 'utf8')
    return {
      format: 'module',
      source: `export default ${JSON.stringify(source)}`,
      shortCircuit: true,
    }
  }

  return nextLoad(url, context)
}
