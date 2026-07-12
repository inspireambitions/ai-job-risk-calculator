import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = process.cwd();
const nextDir = join(root, '.next');
const MAX_INITIAL_JS_GZIP = 250 * 1024;
const MAX_INITIAL_FONT_BYTES = 120 * 1024;

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  }))).flat();
}

try {
  const manifest = JSON.parse(await readFile(join(nextDir, 'app-build-manifest.json'), 'utf8'));
  const routeFiles = new Set([...(manifest.pages['/layout'] || []), ...(manifest.pages['/page'] || [])].filter((file) => file.endsWith('.js')));
  if (routeFiles.size === 0) throw new Error('No initial JavaScript files were found for the root route.');

  let gzipBytes = 0;
  for (const file of routeFiles) gzipBytes += gzipSync(await readFile(join(nextDir, file))).byteLength;

  const mediaFiles = await filesIn(join(nextDir, 'static', 'media')).catch(() => []);
  const fontFiles = mediaFiles.filter((file) => /\.(woff2?|ttf|otf)$/i.test(file));
  const fontBytes = (await Promise.all(fontFiles.map(async (file) => (await stat(file)).size))).reduce((sum, size) => sum + size, 0);

  console.log(`Initial JS: ${gzipBytes} gzip bytes across ${routeFiles.size} files.`);
  console.log(`Initial fonts: ${fontBytes} bytes across ${fontFiles.length} files.`);
  if (gzipBytes > MAX_INITIAL_JS_GZIP || fontBytes > MAX_INITIAL_FONT_BYTES) process.exit(1);
} catch (error) {
  console.error('Performance budget could not be measured.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
