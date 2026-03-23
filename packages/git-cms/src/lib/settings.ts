import type { SiteSettings } from '../types/schemas'

export function parseSettings(json: string): SiteSettings {
  try {
    return JSON.parse(json) as SiteSettings
  } catch {
    return {}
  }
}

export function serializeSettings(settings: SiteSettings): string {
  return JSON.stringify(settings, null, 2)
}

/**
 * Server-side only: reads and parses content/settings.json from the filesystem.
 * Returns an empty object if the file doesn't exist or cannot be parsed.
 */
export function getSettings(absoluteFilePath: string): SiteSettings {
  // Dynamic require so this function is only called server-side
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs') as typeof import('fs')
  try {
    return parseSettings(fs.readFileSync(absoluteFilePath, 'utf-8'))
  } catch {
    return {}
  }
}
