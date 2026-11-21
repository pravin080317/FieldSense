import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

export function workerSource(files, version) {
  return `/* FieldSense app shell ${version}. Farmer records stay in IndexedDB. */
const FILES = ${JSON.stringify(files)};
const PREFIX = 'fieldsense-shell:' + self.registration.scope + ':';
const CACHE = PREFIX + ${JSON.stringify(version)};
const urls = FILES.map(path => new URL(path, self.registration.scope).href);
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try { await cache.addAll(urls.map(url => new Request(url, {cache: 'reload'}))); }
    catch (error) { await caches.delete(CACHE); throw error; }
  })());
});
// Updates wait for old tabs to close. Never force reload an unsaved field form.
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (!['CHECK_SHELL', 'REPAIR_SHELL'].includes(event.data) || !event.ports[0]) return;
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    if (event.data === 'REPAIR_SHELL') {
      try { await cache.addAll(urls.map(url => new Request(url, {cache: 'reload'}))); }
      catch { event.ports[0].postMessage(false); return; }
    }
    const present = await Promise.all(urls.map(url => cache.match(url)));
    event.ports[0].postMessage(present.every(Boolean));
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const root = new URL(self.registration.scope);
  if (url.origin !== root.origin) return;
  const home = url.pathname === root.pathname || url.pathname === root.pathname + 'index.html';
  const target = request.mode === 'navigate' && home
    ? new URL('index.html', root).href : request.url;
  if (!urls.includes(target)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const saved = await cache.match(target);
    return saved || fetch(request);
  })());
});
`;
}

export async function buildOffline(directory = resolve("dist")) {
  const files = [
    "index.html",
    "favicon.svg",
    "icons.svg",
    "images/paddy-field-v2.png",
  ];
  async function assets(folder) {
    for (const entry of await readdir(join(directory, folder), {
      withFileTypes: true,
    })) {
      const path = folder + "/" + entry.name;
      if (entry.isDirectory()) await assets(path);
      else files.push(path);
    }
  }
  await assets("assets");
  await assets("images/rice-reference");
  files.sort();
  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(file);
    hash.update(await readFile(join(directory, file)));
  }
  const version = hash.digest("hex").slice(0, 20);
  await writeFile(join(directory, "sw.js"), workerSource(files, version));
  console.log(`Offline shell: ${files.length} assets, version ${version}`);
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  await buildOffline();
