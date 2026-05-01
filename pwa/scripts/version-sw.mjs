// Stamp dist/sw.js with a build-derived cache name so each deploy invalidates
// the previous Service Worker cache. Runs after `astro build` in the build
// script. Without this, sw.js's CACHE_NAME is static ('pgd-v1') and clients
// keep serving the old shell forever.

import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const SW_PATH = 'dist/sw.js';

async function hashDir(dir) {
  const hash = createHash('sha256');
  async function walk(d) {
    for (const entry of (await readdir(d)).sort()) {
      const full = join(d, entry);
      const st = await stat(full);
      if (st.isDirectory()) await walk(full);
      else if (st.isFile() && full !== SW_PATH) {
        hash.update(entry);
        hash.update(await readFile(full));
      }
    }
  }
  await walk(dir);
  return hash.digest('hex').slice(0, 12);
}

const swSrc = await readFile(SW_PATH, 'utf8');
const buildHash = await hashDir('dist');
const versioned = swSrc.replace(
  /const CACHE_NAME = '[^']+';/,
  `const CACHE_NAME = 'pgd-${buildHash}';`,
);
await writeFile(SW_PATH, versioned, 'utf8');
console.log(`[version-sw] CACHE_NAME = pgd-${buildHash}`);
