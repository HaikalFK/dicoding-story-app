const CACHE_NAME = "dicoding-story-app-v2";
const LOCAL_ASSETS_TO_CACHE = [
  "/dicoding-story-app/",
  "/dicoding-story-app/index.html",
  "/dicoding-story-app/app.bundle.js",
  "/dicoding-story-app/app.css",
  "/dicoding-story-app/manifest.json",
  "/dicoding-story-app/favicon.png",
  "/dicoding-story-app/images/logo.png",
];
const CDN_ASSETS_TO_CACHE = [];

const API_BASE_URL = "https://story-api.dicoding.dev/v1";

self.addEventListener("install", (event) => {
  console.log(`Service Worker (${CACHE_NAME}): Installing...`);
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        console.log(
          `Service Worker (${CACHE_NAME}): Caching local App Shell...`
        );
        let localAssetsAllCached = true;
        try {
          await cache.addAll(LOCAL_ASSETS_TO_CACHE);
          console.log(
            `Service Worker (${CACHE_NAME}): Local assets cached successfully.`
          );
        } catch (error) {
          console.warn(
            `Service Worker (${CACHE_NAME}): cache.addAll for local assets failed, trying individually. Error:`,
            error
          );
          localAssetsAllCached = false;
          for (const urlString of LOCAL_ASSETS_TO_CACHE) {
            try {
              await cache.add(urlString);
            } catch (e) {
              console.error(
                `Service Worker (${CACHE_NAME}): Failed to cache local asset: ${urlString}`,
                e
              );
              localAssetsAllCached = false;
            }
          }
          if (localAssetsAllCached)
            console.log(
              `Service Worker (${CACHE_NAME}): All local assets cached successfully via individual add.`
            );
        }

        if (CDN_ASSETS_TO_CACHE.length > 0) {
          console.log(
            `Service Worker (${CACHE_NAME}): Attempting to cache CDN App Shell...`
          );
          for (const urlString of CDN_ASSETS_TO_CACHE) {
            try {
              const request = new Request(urlString, { mode: "no-cors" });
              const response = await fetch(request);
              if (response) {
                await cache.put(request, response.clone());
              }
            } catch (error) {
              console.warn(
                `Service Worker (${CACHE_NAME}): Failed to pre-cache CDN asset: ${urlString}. Error: ${error.message}`
              );
            }
          }
          console.log(
            `Service Worker (${CACHE_NAME}): CDN App Shell assets caching attempt finished.`
          );
        } else {
          console.log(
            `Service Worker (${CACHE_NAME}): No CDN assets to pre-cache during install.`
          );
        }
      })
      .then(() => {
        console.log(
          `Service Worker (${CACHE_NAME}): Install phase finished, skipping waiting.`
        );
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error(
          `Service Worker (${CACHE_NAME}): Critical error during install phase:`,
          error
        );
      })
  );
});

self.addEventListener("activate", (event) => {
  console.log(`Service Worker (${CACHE_NAME}): Activating...`);
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log(
                `Service Worker (${CACHE_NAME}): Deleting old cache: ${cacheName}`
              );
              return caches.delete(cacheName);
            }
            return null;
          })
        );
      })
      .then(() => {
        console.log(
          `Service Worker (${CACHE_NAME}): Activated and old caches cleaned.`
        );
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", (event) => {
  if (
    !(
      event.request.url.startsWith("http:") ||
      event.request.url.startsWith("https:")
    )
  ) {
    return;
  }
  if (event.request.method !== "GET") {
    return;
  }

  if (event.request.url.startsWith(API_BASE_URL)) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response(
            JSON.stringify({
              error: true,
              message: "Offline dan data tidak tersedia di cache.",
            }),
            {
              headers: { "Content-Type": "application/json" },
              status: 503, // Service Unavailable
              statusText: "Service Unavailable (Offline)",
            }
          );
        })
    );
    return;
  }

  event.respondWith(
    caches
      .match(event.request)
      .then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(event.request).then((networkResponse) => {
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              (event.request.url.startsWith("http:") ||
                event.request.url.startsWith("https:"))
            ) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
        );
      })
      .catch(async (error) => {
        console.warn(
          `SW: Fetch failed for ${event.request.url}, Error: ${error.message}`
        );
        if (
          event.request.mode === "navigate" &&
          event.request.destination === "document"
        ) {
          const cachedIndex = await caches.match("/index.html");
          if (cachedIndex) return cachedIndex;
        }
        throw error;
      })
  );
});

self.addEventListener("push", (event) => {
  let notificationData = {
    title: "Notifikasi Baru Dicoding Story",
    options: {
      body: "Ada cerita baru untukmu!",
      icon: "/images/logo-192x192.png",
    },
  };
  if (event.data) {
    try {
      const dataJson = event.data.json();
      notificationData.title = dataJson.title || notificationData.title;
      if (dataJson.options) {
        notificationData.options.body =
          dataJson.options.body || notificationData.options.body;
        notificationData.options.icon =
          dataJson.options.icon || "/images/logo-192x192.png";
      }
    } catch (e) {}
  }
  event.waitUntil(
    self.registration.showNotification(
      notificationData.title,
      notificationData.options
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const focusedClient = clientList.find((client) => client.focused);
        if (focusedClient) {
          return focusedClient
            .navigate(urlToOpen)
            .then((client) => client.focus());
        }
        if (clientList.length > 0) {
          return clientList[0]
            .navigate(urlToOpen)
            .then((client) => client.focus());
        }
        return clients.openWindow(urlToOpen);
      })
  );
});
