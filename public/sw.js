/* TinyKit offline shell — static assets only; never touch Next.js runtime */
const CACHE = "tinykit-v2";
const PRECACHE = ["/manifest.webmanifest"];

function shouldBypass(url) {
  const { pathname } = url;
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/__next") ||
    pathname.includes("hot-update") ||
    pathname.includes("webpack-hmr") ||
    pathname === "/sw.js"
  );
}

function isStaticAsset(url) {
  return /\.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|otf|webmanifest)$/i.test(
    url.pathname,
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
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
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (shouldBypass(url)) return;

  // Navigations / HTML: network-first, offline fallback to cache
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/"))),
    );
    return;
  }

  // Static public assets only: cache-first
  if (!isStaticAsset(url)) return;

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
