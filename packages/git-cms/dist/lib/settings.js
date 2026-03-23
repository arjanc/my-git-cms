export function parseSettings(json) {
    try {
        return JSON.parse(json);
    }
    catch {
        return {};
    }
}
export function serializeSettings(settings) {
    return JSON.stringify(settings, null, 2);
}
/**
 * Server-side only: reads and parses content/settings.json from the filesystem.
 * Returns an empty object if the file doesn't exist or cannot be parsed.
 */
export function getSettings(absoluteFilePath) {
    // Dynamic require so this function is only called server-side
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    try {
        return parseSettings(fs.readFileSync(absoluteFilePath, 'utf-8'));
    }
    catch {
        return {};
    }
}
