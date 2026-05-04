const CACHE_NAME = "star-first-app-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.webmanifest",
  "/icon.svg",
  "/robots.txt",
  "/sitemap.xml",
  "/sw.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Partial cache is acceptable
        return Promise.resolve();
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Handle API requests (weather, quotes, search)
  if (url.hostname === "api.openweathermap.org" || 
      url.hostname === "api.quotable.io" ||
      url.hostname === "api.duckduckgo.com" ||
      url.hostname === "en.wikipedia.org") {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) {
          // Return cached version and update in background
          fetch(event.request).then((response) => {
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, response.clone());
              });
            }
          }).catch(() => {
            // Silently fail background update
          });
          return cached;
        }
        // No cache, fetch from network
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clonedResponse);
            });
          }
          return response;
        }).catch(() => {
          return new Response(JSON.stringify({ error: "Offline: API not available" }), {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "application/json" }
          });
        });
      })
    );
    return;
  }

  // Skip cross-origin requests (except APIs above)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // HTML: network-first strategy
  if (event.request.destination === "" || event.request.destination === "document") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return cached || new Response("Offline: Page not available", {
              status: 503,
              statusText: "Service Unavailable"
            });
          });
        })
    );
    return;
  }

  // CSS, JS, Images: cache-first strategy
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then((response) => {
        const clonedResponse = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clonedResponse);
        });
        return response;
      }).catch(() => {
        return new Response("Offline: Resource not available", {
          status: 503,
          statusText: "Service Unavailable"
        });
      });
    })
  );
});
