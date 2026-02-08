const VERSION = "v1.0.0";
const CACHE_NAME = `nutricare-sa-cache-${VERSION}`;

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./offline.html",

  "./icon-192.png",
  "./icon-512.png",

  "./adult.csv",
  "./paediatric.csv"
];

/* ===============================
   INSTALL — Cache Core Files
   =============================== */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

/* ===============================
   ACTIVATE — Remove Old Caches
   =============================== */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

/* ===============================
   FETCH — Offline First Strategy
   =============================== */
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match("./offline.html"));
    })
  );
});