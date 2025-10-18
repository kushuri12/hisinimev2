const CACHE_NAME = "hisinime-v2";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./src/router/router.js",
  "./src/assets/icon_192.png",
  "./src/assets/icon_512.png",
];

// Install Service Worker dan cache semua aset
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Langsung aktifkan SW baru
});

// Aktifkan Service Worker dan bersihkan cache lama jika ada
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
  self.clients.claim(); // Ambil kontrol langsung
});

// Fetch handler: ambil dari cache dulu, kalau tidak ada fetch dari network
// Kalau request navigasi gagal, fallback ke index.html (untuk SPA routing)
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(e.request)
        .then((networkResponse) => {
          // Opsional: simpan response ke cache supaya bisa offline berikutnya
          return caches.open(CACHE_NAME).then((cache) => {
            if (e.request.method === "GET" && networkResponse.status === 200) {
              cache.put(e.request, networkResponse.clone());
            }
            return networkResponse;
          });
        })
        .catch(() => {
          // Kalau offline dan navigasi page, fallback ke index.html
          if (e.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
    })
  );
});
