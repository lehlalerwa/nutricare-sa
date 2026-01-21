const CACHE_NAME = "nutricare-sa-v1";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  // CSV files
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQG1Q3SV22JE3A54kFrIrNIXA4W1ah8zxSNFn-nR3OsNIevSG6ybpIJV_d2_zlbP1FwzhCyCs2JN8x0/pub?gid=1989255355&single=true&output=csv",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR8jGwgvVsgAefxBFcXEhWsqNbnU6trUosFe-FLvr-E_IvZH44txGhH8g5FQDcDy2NbgRqAx_6eJdnO/pub?gid=2024151986&single=true&output=csv",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTysJgBs-JnGgjMqTE8ifEixLZIwl38ykLjB6tnk4aXUhtw0EqoAxh5iRPhqEuIIuWXbrfRqyfaKgBx/pub?gid=0&single=true&output=csv"
];

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ACTIVATE
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

// FETCH (online first, offline fallback)
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
