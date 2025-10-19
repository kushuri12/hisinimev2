const CACHE_NAME = "hisinime-v2";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/src/router/router.js",
  "/src/page/home.js",
  "/src/page/watch.js",
  "/src/page/detail.js",
  "/src/page/search.js",
  "/src/assets/icon_192.png",
  "/src/assets/icon_512.png",
];

// Install Service Worker dan cache semua aset
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Aktivasi SW dan hapus cache lama
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(e.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            if (e.request.method === "GET" && networkResponse.status === 200) {
              cache.put(e.request, networkResponse.clone());
            }
            return networkResponse;
          });
        })
        .catch(() => {
          if (e.request.mode === "navigate") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
