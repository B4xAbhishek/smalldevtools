/* TinyKit kill-switch / production SW
 * On localhost this file should never stay registered — clients self-unregister.
 * In production: only cache a few static assets; never touch Next.js runtime.
 */
const CACHE = "tinykit-v3-static";
const IS_LOCAL =
  self.location.hostname === "localhost" ||
  self.location.hostname === "127.0.0.1" ||
  self.location.hostname === "[::1]";

async function nuke() {
  const keys = await caches.keys();
  await Promise.all(keys.map((k) => caches.delete(k)));
  const regs = await self.registration.unregister();
  return regs;
}

self.addEventListener("install", (event) => {
  if (IS_LOCAL) {
    event.waitUntil(self.skipWaiting());
    return;
  }
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(["/manifest.webmanifest", "/logo.svg", "/icon.svg"]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  if (IS_LOCAL) {
    event.waitUntil(
      nuke().then(() =>
        self.clients.matchAll({ type: "window" }).then((clients) => {
          for (const client of clients) {
            client.navigate(client.url);
          }
        }),
      ),
    );
    return;
  }

  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  // Never intercept anything on local — stop request storms immediately
  if (IS_LOCAL) return;

  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const { pathname } = url;
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/__next") ||
    pathname.includes("hot-update") ||
    pathname.includes("webpack-hmr") ||
    pathname === "/sw.js" ||
    pathname.startsWith("/api/")
  ) {
    return;
  }

  // Only cache-first for known static files in public/
  if (
    !/\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?|webmanifest)$/i.test(pathname) &&
    pathname !== "/manifest.webmanifest"
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    }),
  );
});
